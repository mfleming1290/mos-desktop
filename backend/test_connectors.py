import hashlib
import json
import tempfile
import unittest
import subprocess
import sys
import os
from pathlib import Path
from connectors import ConnectorAuthority


class ConnectorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.discovery = self.root / 'discovery'
        self.authority = self.root / 'authority'
        self.discovery.mkdir()
        self.authority.mkdir()
        self.folder = self.discovery / 'canary'
        self.folder.mkdir()
        self.code = b'export const createContentHost = () => ({attach:async()=>({code:"unavailable"})});'
        self.manifest = dict(id='canary', version='1', abi=1, context='isolated-frame', capabilities=[],
                             moduleSha256=hashlib.sha256(self.code).hexdigest())
        self.write()
        self.host = ConnectorAuthority(self.discovery, self.authority, 'test-owner')

    def tearDown(self):
        for p in self.root.rglob('*'):
            if p.is_file():
                p.chmod(0o600)
        self.temp.cleanup()

    def write(self):
        (self.folder / 'manifest.json').write_text(json.dumps(self.manifest))
        (self.folder / 'adapter.mjs').write_bytes(self.code)

    def approve(self):
        item = self.host.list()['connectors'][0]
        state = self.host.decide('canary', item['identity'], 'approved', self.host.load()['revision'])
        return item, state

    def test_real_staging_cas_restart_revoke_and_reapproval(self):
        item = self.host.list()['connectors'][0]
        self.assertEqual(item['decision'], 'pending')
        self.assertEqual(list(self.authority.iterdir()), [])
        with self.assertRaises(ValueError):
            self.host.activate('canary', item['identity'], 0)
        item, state = self.approve()
        artifact = self.host.activate('canary', item['identity'], state['revision'])
        self.assertEqual((self.authority / item['identity'] / 'adapter.mjs').read_bytes(), self.code)
        self.assertEqual(artifact['context'], 'isolated-frame')
        restarted = ConnectorAuthority(self.discovery, self.authority, 'test-owner')
        self.assertEqual(restarted.list()['connectors'][0]['decision'], 'approved')
        with self.assertRaises(ValueError):
            restarted.decide('canary', item['identity'], 'revoked', 0)
        restarted.decide('canary', item['identity'], 'revoked', 1)
        with self.assertRaises(ValueError):
            restarted.activate('canary', item['identity'], 2)
        self.code += b'\n// changed'
        self.manifest['moduleSha256'] = hashlib.sha256(self.code).hexdigest()
        self.write()
        self.assertEqual(restarted.list()['connectors'][0]['decision'], 'pending')
        self.assertTrue((self.authority / item['identity']).exists())

    def test_duplicate_corrupt_future_and_context_fail_closed(self):
        item, _ = self.approve()
        duplicate = self.discovery / 'duplicate'
        duplicate.mkdir()
        for name in ('manifest.json', 'adapter.mjs'):
            (duplicate / name).write_bytes((self.folder / name).read_bytes())
        self.assertEqual(self.host.list()['connectors'], [])
        with self.assertRaises(ValueError):
            self.host.activate('canary', item['identity'], 1)
        self.host.path.write_text('{"version":99}')
        self.assertFalse(self.host.list()['writable'])
        self.assertEqual(self.host.last['revision'], 1)
        with self.assertRaises(ValueError):
            self.host.decide('canary', item['identity'], 'approved', 1)
        self.manifest['context'] = 'privileged-parent'
        self.write()
        self.assertTrue(self.host.scan()[1])

    def test_operator_gui_same_authority_and_exact_bytes(self):
        item, state = self.approve()
        result = subprocess.run([sys.executable, str(Path(__file__).with_name('connectors.py')),
                                 str(self.discovery), str(self.authority), 'test-owner',
                                 '--decision', 'disabled', '--id', 'canary', '--identity', item['identity'],
                                 '--revision', str(state['revision'])], capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout)['revision'], 2)
        self.assertEqual(self.host.list()['connectors'][0]['decision'], 'disabled')
        with self.assertRaises(ValueError):
            self.host.activate('canary', item['identity'], 2)
        self.host.decide('canary', item['identity'], 'approved', 2)
        self.code += b'\n// swapped'
        self.write()  # Deliberately wrong hash: inert discovery fails closed.
        self.assertEqual(self.host.list()['connectors'], [])
        with self.assertRaises(ValueError):
            self.host.activate('canary', item['identity'], 3)
        self.manifest['moduleSha256'] = hashlib.sha256(self.code).hexdigest()
        self.manifest['capabilities'] = ['files']
        self.write()
        self.assertEqual(self.host.list()['connectors'], [])

    @unittest.skipUnless(os.name == 'posix', 'Linux symlink proof')
    def test_capacity_rejection_preserves_previous_valid_state(self):
        item, _ = self.approve()
        record = self.host.load()['records']['canary']
        # Seed a valid full history while only one discovery folder is present.
        state = dict(self.host.load(), records={f'old-{i}': dict(record) for i in range(256)})
        self.host.path.write_text(json.dumps(state))
        before = self.host.path.read_bytes()
        with self.assertRaisesRegex(ValueError, 'capacity exceeded'):
            self.host.decide('canary', item['identity'], 'approved', state['revision'])
        self.assertEqual(self.host.path.read_bytes(), before)
        self.assertEqual(self.host.load()['revision'], state['revision'])
        self.assertTrue(self.host.list()['writable'])
        self.assertFalse((self.authority / 'approval.next').exists())
        # Updating an existing record at capacity remains allowed.
        self.manifest['id'] = 'old-0'
        self.write()
        item = self.host.list()['connectors'][0]
        self.host.decide('old-0', item['identity'], 'disabled', state['revision'])
        self.assertEqual(len(self.host.load()['records']), 256)

    @unittest.skipUnless(os.name == 'posix', 'Linux symlink proof')
    def test_symlink_escape_and_stage_corruption(self):
        item, state = self.approve()
        self.host.activate('canary', item['identity'], state['revision'])
        staged = self.authority / item['identity'] / 'adapter.mjs'
        staged.chmod(0o600)
        staged.write_bytes(b'changed')
        with self.assertRaises(ValueError):
            self.host.activate('canary', item['identity'], state['revision'])
        (self.folder / 'adapter.mjs').unlink()
        (self.folder / 'adapter.mjs').symlink_to(staged)
        self.assertEqual(self.host.list()['connectors'], [])
        with self.assertRaises(ValueError):
            self.host.artifact('../authority')


if __name__ == '__main__':
    unittest.main()
