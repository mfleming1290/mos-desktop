import time
import unittest

from aiohttp import ClientSession, web
from aiohttp.test_utils import TestServer

from home import Blocked
from streaming import StreamGateway, stream_path, bounded_body


class StreamPaths(unittest.TestCase):
    def test_fixed_surface(self):
        self.assertEqual(stream_path('assets/index-a.js', 'GET'), '/assets/index-a.js')
        self.assertEqual(stream_path('api/ws', 'GET', True), '/api/ws')
        for path in ('../secret', 'assets/../secret', 'assets/%2e', 'api/upload', 'api/commands', 'files', 'assets/a/b'):
            with self.subTest(path=path), self.assertRaises(Blocked):
                stream_path(path, 'GET')
        with self.assertRaises(Blocked):
            stream_path('', 'POST')
        with self.assertRaises(Blocked):
            stream_path('api/health', 'GET', True)


class StreamLease(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.healthy = True
        async def health(request):
            self.assertEqual(request.headers['X-MOS-Owner'], 'owner')
            self.assertEqual(request.headers['X-MOS-Generation'], 'generation')
            return web.Response(status=200 if self.healthy else 503)
        app = web.Application()
        app.router.add_get('/stream/api/health', health)
        async def chunks(request):
            response = web.StreamResponse()
            await response.prepare(request)
            for _ in range(4):
                await response.write(b'x' * 65536)
            await response.write_eof()
            return response
        app.router.add_get('/chunks', chunks)
        self.server = TestServer(app)
        await self.server.start_server()
        self.client = ClientSession()
        self.gateway = StreamGateway(dict(stream_origin=str(self.server.make_url('')).rstrip('/'),
                                          owner_id='owner', generation='generation', origin='https://mos.test'),
                                     self.client, None)

    async def asyncTearDown(self):
        await self.client.close()
        await self.server.close()

    async def test_controller_takeover_and_credential_fence(self):
        first = await self.gateway.attach({'view': 'first'}, 'credential-a')
        second = await self.gateway.attach({'view': 'second'}, 'credential-a')
        self.assertTrue(first['controller'])
        self.assertFalse(second['controller'])
        takeover = await self.gateway.attach({'view': 'second', 'takeover': True}, 'credential-a')
        self.assertTrue(takeover['controller'])
        self.assertEqual(self.gateway.slots['first']['role'], 'viewer')
        renewed = await self.gateway.attach({'view': 'second'}, 'credential-a')
        self.assertEqual(takeover['path'], renewed['path'])
        replaced = await self.gateway.attach({'view': 'second'}, 'credential-b')
        self.assertNotEqual(replaced['path'], renewed['path'])
        await self.gateway.detach({'view': 'second'}, 'credential-a')
        self.assertIn('second', self.gateway.slots)
        await self.gateway.detach({'view': 'second'}, 'credential-b')
        self.assertNotIn('second', self.gateway.slots)
        self.assertNotIn('credential', str(replaced))

    async def test_chunked_assets_are_not_truncated(self):
        async with self.client.get(self.server.make_url('/chunks')) as response:
            data = await bounded_body(response)
        self.assertEqual(data, b'x' * (4 * 65536))

    async def test_capacity_expiry_and_failed_admission(self):
        for number in range(4):
            await self.gateway.attach({'view': str(number)}, 'credential')
        with self.assertRaises(Blocked):
            await self.gateway.attach({'view': 'fifth'}, 'credential')
        self.gateway.slots['0']['expires'] = time.monotonic() - 1
        await self.gateway.attach({'view': 'fifth'}, 'credential')
        self.assertNotIn('0', self.gateway.slots)
        self.healthy = False
        with self.assertRaises(Blocked):
            await self.gateway.attach({'view': 'fifth'}, 'credential')
        with self.assertRaises(Blocked):
            await self.gateway.attach({'view': '../unsafe'}, 'credential')


if __name__ == '__main__':
    unittest.main()
