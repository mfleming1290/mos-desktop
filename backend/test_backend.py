import asyncio
import base64
import json
import os
from pathlib import Path
import shutil
import ssl
import subprocess
import tempfile
import unittest

from aiohttp import ClientSession, web
from home import Blocked, Conflict, Home, LIMIT
from service import agent_app, bridge_app, secure_url
from terminal import Terminals


def mount_id(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        return next(line.split()[1] for line in Path(f'/proc/self/fdinfo/{fd}').read_text().splitlines()
                    if line.startswith('mnt_id:'))
    finally:
        os.close(fd)


def open_home(path):
    return Home(str(path), os.geteuid(), path.stat().st_dev, mount_id(path))


class Files(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='mos-home-test-')
        self.path = Path(self.scratch.name)
        self.home = open_home(self.path)

    def tearDown(self):
        self.home.close()
        self.scratch.cleanup()

    def test_create_read_atomic_save_conflict(self):
        self.home.mkdir('Documents')
        first = self.home.write('example.txt', b'one', None)
        self.assertEqual(self.home.read('example.txt'), (b'one', first))
        with self.assertRaises(Blocked):
            self.home.write('example.txt', b'lost', first)
        with self.assertRaises(Conflict):
            self.home.write('example.txt', b'lost', None)
        self.assertEqual(self.home.read('example.txt')[0], b'one')
        self.assertEqual(len(self.home.list()['entries']), 2)

    def test_traversal_links_specials_and_bounds(self):
        for path in ['../outside', '/etc/passwd', 'x/../../y', 'x\\y', '%2e%2e/x', 'x\x00y']:
            with self.subTest(path=path), self.assertRaises(Blocked):
                self.home.read(path)
        (self.path / 'link').symlink_to('/etc/passwd')
        with self.assertRaises(Blocked):
            self.home.read('link')
        (self.path / 'file').write_bytes(b'1')
        os.link(self.path / 'file', self.path / 'hardlink')
        with self.assertRaises(Blocked):
            self.home.read('hardlink')
        os.mkfifo(self.path / 'fifo')
        with self.assertRaises(Blocked):
            self.home.read('fifo')
        with self.assertRaises(Blocked):
            self.home.write('large', b'x' * (LIMIT + 1), None)
        self.assertFalse((self.path / 'large').exists())

    def test_nested_writes_are_not_admitted(self):
        self.home.mkdir('Documents')
        with self.assertRaises(Blocked):
            self.home.write('Documents/new', b'new', None)
        with self.assertRaises(Blocked):
            self.home.mkdir('Documents/nested')
        self.assertEqual(self.home.list('Documents')['entries'], [])

    def test_replacement_missing_identity_and_reopen(self):
        self.home.write('.settings', b'persist', None)
        restarted = open_home(self.path)
        self.assertEqual(restarted.read('.settings')[0], b'persist')
        restarted.close()
        moved = self.path.with_name(self.path.name + '-moved')
        self.path.rename(moved)
        self.path.mkdir()
        try:
            with self.assertRaises(Blocked):
                self.home.write('fallback', b'bad', None)
            self.assertFalse((self.path / 'fallback').exists())
        finally:
            self.path.rmdir()
            moved.rename(self.path)
        with self.assertRaises(Blocked):
            Home(str(self.path), os.geteuid(), self.path.stat().st_dev + 1, mount_id(self.path))

    def test_scratch_restore(self):
        self.home.write('document', b'restored', None)
        with tempfile.TemporaryDirectory(prefix='mos-restore-test-') as target:
            shutil.copytree(self.path, Path(target) / 'home')
            restored = open_home(Path(target) / 'home')
            try:
                self.assertEqual(restored.read('document')[0], b'restored')
            finally:
                restored.close()

    def test_symlink_swap_and_atomic_destination_conflict(self):
        import threading
        self.home.mkdir('node')
        (self.path / 'node' / 'file').write_bytes(b'inside')
        with tempfile.TemporaryDirectory(prefix='mos-outside-test-') as outside:
            (Path(outside) / 'file').write_bytes(b'outside-protected')
            stop = threading.Event()
            def swap():
                while not stop.is_set():
                    (self.path / 'node').rename(self.path / 'parked')
                    (self.path / 'node').symlink_to(outside, target_is_directory=True)
                    (self.path / 'node').unlink()
                    (self.path / 'parked').rename(self.path / 'node')
            thread = threading.Thread(target=swap)
            thread.start()
            try:
                for _ in range(500):
                    try:
                        self.assertEqual(self.home.read('node/file')[0], b'inside')
                    except (Blocked, FileNotFoundError):
                        pass
            finally:
                stop.set()
                thread.join()
            (self.path / 'destination').symlink_to(Path(outside) / 'file')
            with self.assertRaises(Conflict):
                self.home.write('destination', b'never overwrite', None)
            self.assertEqual((Path(outside) / 'file').read_bytes(), b'outside-protected')


class Pty(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='mos-pty-test-')
        self.home = open_home(Path(self.scratch.name))
        self.terminals = Terminals(self.home, 'generation-one', capacity=2, replay_bytes=1024)

    async def asyncTearDown(self):
        await self.terminals.shutdown()
        self.home.close()
        self.scratch.cleanup()

    async def test_detach_reattach_ownership_control_and_end(self):
        key = self.terminals.create('owner')['id']
        self.assertTrue(self.terminals.attach('owner', key, 'first')['controller'])
        self.assertFalse(self.terminals.attach('owner', key, 'second')['controller'])
        with self.assertRaises(Blocked):
            self.terminals.input('owner', key, 'second', b'bad')
        with self.assertRaises(Blocked):
            self.terminals.output('other', key, 0)
        self.terminals.resize('owner', key, 'first', 90, 30)
        self.terminals.input('owner', key, 'first', b"printf 'PTY_PROOF'; pwd\n")
        self.terminals.detach('owner', key, 'first')
        await asyncio.sleep(.2)
        output = self.terminals.output('owner', key, 0)
        data = base64.b64decode(output['data'])
        self.assertIn(b'PTY_PROOF', data)
        self.assertIn(self.scratch.name.encode(), data)
        self.assertFalse(output['exited'])
        self.assertTrue(self.terminals.attach('owner', key, 'second')['controller'])
        self.assertTrue((await self.terminals.end('owner', key))['exited'])
        with self.assertRaises(Blocked):
            self.terminals.output('owner', key, 0)

    async def test_replay_capacity_lease_and_service_shutdown(self):
        key = self.terminals.create('owner')['id']
        self.terminals.create('owner')
        with self.assertRaises(Blocked):
            self.terminals.create('owner')
        self.terminals.attach('owner', key, 'first')
        self.terminals.input('owner', key, 'first', b"printf '%20000s' x\n")
        await asyncio.sleep(.2)
        self.assertTrue(self.terminals.output('owner', key, 0)['gap'])
        self.assertLessEqual(self.terminals.sessions[key]['bytes'], 1024)
        self.terminals.sessions[key]['lease'] = 0
        with self.assertRaises(Blocked):
            self.terminals.input('owner', key, 'first', b'bad')
        processes = [s['process'] for s in self.terminals.sessions.values()]
        await self.terminals.shutdown()
        self.assertTrue(all(p.poll() is not None for p in processes))
        replacement = Terminals(self.home, 'generation-two')
        with self.assertRaises(Blocked):
            replacement.output('owner', key, 0)


class HttpsBoundary(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='mos-tls-test-')
        self.path = Path(self.scratch.name)
        self.runners = []
        # Ephemeral test CA, never installed into an OS trust store.
        def openssl(*args):
            subprocess.run(['openssl', *args], cwd=self.path, check=True,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        openssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key',
                '-out', 'ca.crt', '-days', '1', '-subj', '/CN=MOS disposable test CA')
        for name in ['server', 'bridge']:
            openssl('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', name + '.key',
                    '-out', name + '.csr', '-subj', '/CN=localhost')
            (self.path / 'extensions').write_text('subjectAltName=DNS:localhost\n')
            openssl('x509', '-req', '-in', name + '.csr', '-CA', 'ca.crt', '-CAkey',
                    'ca.key', '-CAcreateserial', '-out', name + '.crt', '-days', '1',
                    '-extfile', 'extensions')
        self.client_ssl = ssl.create_default_context(cafile=str(self.path / 'ca.crt'))
        self.mtls = ssl.create_default_context(cafile=str(self.path / 'ca.crt'))
        self.mtls.load_cert_chain(self.path / 'bridge.crt', self.path / 'bridge.key')
        (self.path / 'home').mkdir()
        self.config = {'owner_id': 'owner-fixture-id', 'generation': 'test-generation'}
        self.agent = await self.serve(agent_app(self.config, open_home(self.path / 'home')), True)
        self.revoked = False

        async def profile(request):
            token = request.headers.get('Authorization')
            if self.revoked or token not in ('Bearer owner', 'Bearer other'):
                return web.json_response({}, status=403)
            return web.json_response({'id': 'owner-fixture-id' if token == 'Bearer owner' else 'other',
                                      'username': 'matt', 'role': 'admin'})
        app = web.Application()
        app.router.add_get('/api/v1/auth/profile', profile)
        self.mos = await self.serve(app)
        config = dict(self.config, origin='https://localhost', mos_origin=self.mos,
                      backend_origin=self.agent)
        # Test-only CA injection into the MOS client, without changing production
        # global trust; production uses OS trust for the configured MOS origin.
        from unittest.mock import patch
        from aiohttp import TCPConnector
        with patch('service.TCPConnector', side_effect=lambda **kw: TCPConnector(ssl=self.client_ssl, **kw)):
            self.bridge = await self.serve(bridge_app(config, self.mtls))
        self.client = ClientSession()

    async def serve(self, app, mtls=False):
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(self.path / 'server.crt', self.path / 'server.key')
        if mtls:
            context.load_verify_locations(self.path / 'ca.crt')
            context.verify_mode = ssl.CERT_REQUIRED
        runner = web.AppRunner(app, access_log=None)
        await runner.setup()
        site = web.TCPSite(runner, '127.0.0.1', 0, ssl_context=context)
        await site.start()
        self.runners.append(runner)
        return 'https://localhost:' + str(site._server.sockets[0].getsockname()[1])

    async def asyncTearDown(self):
        if hasattr(self, 'client'):
            await self.client.close()
        for runner in reversed(self.runners):
            await runner.cleanup()
        self.scratch.cleanup()

    async def call(self, operation='health', args=None, token='owner', origin='https://localhost', **extra):
        headers = {'Origin': origin}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        async with self.client.post(self.bridge + '/desktop-api/v1/operation',
                                    headers=headers, ssl=self.client_ssl,
                                    json=dict(operation=operation, args=args or {}, **extra)) as response:
            return response.status, await response.json()

    async def test_authentication_origin_generation_and_files(self):
        self.assertEqual((await self.call(token=None))[0], 401)
        self.assertEqual((await self.call(token='other'))[0], 403)
        self.assertEqual((await self.call(origin='https://attacker.invalid'))[0], 403)
        status, health = await self.call(owner='other', generation='forged')
        self.assertEqual(status, 200)  # caller identity/generation are not forwarded
        self.assertEqual(health['generation'], 'test-generation')
        self.assertEqual((await self.call('host.exec'))[0], 403)
        self.assertEqual((await self.call('write', {'path': 'proof', 'data': 'b25l', 'expected': None}))[0],200)
        status, read = await self.call('read', {'path': 'proof'})
        self.assertEqual(base64.b64decode(read['data']), b'one')
        self.assertEqual(len(read['version']), 64)
        _, created = await self.call('terminal.create')
        self.assertEqual((await self.call('terminal.attach', {'id':created['id'], 'view':'test-view',
                                                            'generation':'obsolete'}))[0],403)
        self.assertEqual((await self.call('terminal.attach', {'id':created['id'], 'view':'test-view',
                                                            'generation':created['generation']}))[0],200)
        self.revoked = True
        self.assertEqual((await self.call('read', {'path': 'proof'}))[0], 401)

    async def test_private_channel_requires_certificate_and_generation(self):
        with self.assertRaises(Exception):
            async with self.client.post(self.agent + '/v1/operation', ssl=self.client_ssl,
                                        json={}):
                self.fail('unauthenticated agent accepted request')
        async with self.client.post(self.agent + '/v1/operation', ssl=self.mtls,
                                    json={'owner': self.config['owner_id'], 'generation': 'old',
                                          'operation': 'health'}) as response:
            self.assertEqual(response.status, 403)
        for url in ['http://localhost', 'https://localhost/path', 'https://u:p@localhost',
                    'https://localhost?token=secret']:
            with self.assertRaises(ValueError):
                secure_url(url)

    async def test_readonly_admission_and_real_service_process_restart(self):
        self.assertEqual((await self.call('write', {'path': 'denied', 'data': 'b25l', 'expected': 'old'}))[1],
                         {'error': 'saveCopyRequired'})
        self.assertFalse((self.path / 'home' / 'denied').exists())
        import socket
        import sys
        with socket.socket() as reserve:
            reserve.bind(('127.0.0.1', 0))
            port = reserve.getsockname()[1]
        config = dict(self.config, home=str(self.path / 'home'), uid=os.geteuid(),
                      device=(self.path / 'home').stat().st_dev,
                      mount_id=mount_id(self.path / 'home'), listen='127.0.0.1', port=port,
                      certificate=str(self.path / 'server.crt'), key=str(self.path / 'server.key'),
                      bridge_ca=str(self.path / 'ca.crt'))
        (self.path / 'agent.json').write_text(json.dumps(config))
        processes = []
        previous_session = None
        try:
            for generation in ['original', 'replacement']:
                config['generation'] = generation
                (self.path / 'agent.json').write_text(json.dumps(config))
                process = subprocess.Popen([sys.executable, str(Path(__file__).with_name('service.py')),
                                            'agent', str(self.path / 'agent.json')],
                                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                processes.append(process)
                ready = False
                for _ in range(100):
                    try:
                        async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                                    json={'owner': config['owner_id'], 'generation': generation,
                                                          'operation': 'health'}) as response:
                            ready = response.status == 200
                    except OSError:
                        pass
                    if ready:
                        break
                    await asyncio.sleep(.02)
                self.assertTrue(ready)
                if generation == 'original':
                    async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                                json={'owner': config['owner_id'], 'generation': generation,
                                                      'operation': 'write', 'args':{'path':'restart-proof','data':'cGVyc2lzdA==','expected':None}}) as response:
                        self.assertEqual(response.status, 200)
                    async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                                json={'owner': config['owner_id'], 'generation': generation,
                                                      'operation': 'terminal.create'}) as response:
                        previous_session = (await response.json())['id']
                else:
                    async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                                json={'owner': config['owner_id'], 'generation': generation,
                                                      'operation': 'read', 'args':{'path':'restart-proof'}}) as response:
                        self.assertEqual(base64.b64decode((await response.json())['data']), b'persist')
                    async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                                json={'owner': config['owner_id'], 'generation': generation,
                                                      'operation': 'terminal.output', 'args':{'id':previous_session,'after':0}}) as response:
                        self.assertEqual(response.status, 403)
                async with self.client.post(f'https://localhost:{port}/v1/operation', ssl=self.mtls,
                                            json={'owner': config['owner_id'], 'generation': 'stale',
                                                  'operation': 'health'}) as response:
                    self.assertEqual(response.status, 403)
                process.terminate()
                for _ in range(100):
                    if process.poll() is not None:
                        break
                    await asyncio.sleep(.02)
                self.assertEqual(process.returncode, 0)
        finally:
            for process in processes:
                if process.poll() is None:
                    process.kill()
                process.wait()


if __name__ == '__main__':
    unittest.main()
