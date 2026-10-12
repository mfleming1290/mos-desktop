"""Fixed Selkies transport. Browser capabilities never contain MOS credentials."""
import asyncio
import os
import re
import secrets
import time

from aiohttp import BasicAuth, ClientSession, WSMsgType, web
from home import Blocked

PUBLIC = re.compile(r'^[a-f0-9]{64}$')
VIEW = re.compile(r'^[a-zA-Z0-9-]{1,80}$')
WEBSOCKETS = {'api/websockets', 'api/ws'}


async def bounded_body(response):
    data = bytearray()
    async for chunk in response.content.iter_chunked(65536):
        data.extend(chunk)
        if len(data) > 8 * 1024 * 1024:
            raise Blocked('capacityExceeded')
    return bytes(data)


def stream_path(path, method, websocket=False):
    # No file browser/upload, commands, sharing, tokens or process-control API.
    if method != 'GET' or any(part in ('.', '..') for part in path.split('/')) or any(c in path for c in ('%', '\\', '\x00')):
        raise Blocked('forbidden')
    if websocket:
        if path not in WEBSOCKETS:
            raise Blocked('forbidden')
    elif path not in ('', 'api/status', 'api/health', 'icon.png', 'icon-512.png', 'manifest.json') and not re.fullmatch(r'assets/[a-zA-Z0-9_.-]+', path):
        raise Blocked('forbidden')
    return '/' + path


async def relay(downstream, upstream, alive=lambda: True):
    async def pump(source, target):
        async for message in source:
            if not alive():
                break
            if message.type == WSMsgType.BINARY:
                await target.send_bytes(message.data)
            elif message.type == WSMsgType.TEXT:
                await target.send_str(message.data)
            elif message.type in (WSMsgType.CLOSE, WSMsgType.CLOSED, WSMsgType.ERROR):
                break
    async def expiry():
        while alive() and not downstream.closed and not upstream.closed:
            await asyncio.sleep(.5)
    jobs = [asyncio.create_task(pump(downstream, upstream)),
            asyncio.create_task(pump(upstream, downstream)), asyncio.create_task(expiry())]
    try:
        await asyncio.wait(jobs, return_when=asyncio.FIRST_COMPLETED)
    finally:
        for job in jobs:
            job.cancel()
        await asyncio.gather(*jobs, return_exceptions=True)
        await upstream.close()
        await downstream.close()


class StreamGateway:
    def __init__(self, config, client, backend_ssl):
        self.config, self.client, self.ssl = config, client, backend_ssl
        self.slots = {}

    async def attach(self, args, credential):
        view = args.get('view')
        if not isinstance(view, str) or not VIEW.fullmatch(view):
            raise Blocked('forbidden')
        async with self.client.get(self.config['stream_origin'] + '/stream/api/health',
                                   ssl=self.ssl, allow_redirects=False, headers={
                                       'X-MOS-Owner': self.config['owner_id'],
                                       'X-MOS-Generation': self.config['generation'],
                                       'X-MOS-Stream-Role': 'viewer'}) as response:
            if response.status != 200:
                raise Blocked('streamUnavailable')
        now = time.monotonic()
        for key, slot in list(self.slots.items()):
            if slot['expires'] < now:
                del self.slots[key]
        slot = self.slots.get(view)
        if slot and slot['credential'] != credential:
            del self.slots[view]
            slot = None
        controller = next((s for s in self.slots.values() if s['role'] == 'controller'), None)
        if slot is None:
            if len(self.slots) >= 4:
                raise Blocked('capacityExceeded')
            slot = dict(ticket=secrets.token_hex(32), credential=credential,
                        role='viewer' if controller else 'controller', expires=now + 20)
            self.slots[view] = slot
        if args.get('takeover') is True:
            for other in self.slots.values():
                if other is not slot:
                    other['role'] = 'viewer'
            slot['role'] = 'controller'
        elif not controller:
            slot['role'] = 'controller'
        slot['expires'] = now + 20
        return {'path': '/desktop-stream/' + slot['ticket'] + '/',
                'controller': slot['role'] == 'controller', 'expiresIn': 20}

    async def detach(self, args, credential):
        slot = self.slots.get(args.get('view'))
        if slot and slot['credential'] == credential:
            del self.slots[args['view']]
        return {}

    async def handle(self, request):
        ticket = request.match_info['ticket']
        if not PUBLIC.fullmatch(ticket):
            raise Blocked('forbidden')
        slot = next((s for s in self.slots.values() if secrets.compare_digest(s['ticket'], ticket)), None)
        def alive():
            return slot is not None and slot in self.slots.values() and slot['expires'] > time.monotonic()
        if not alive():
            raise Blocked('forbidden')
        origin = request.headers.get('Origin')
        # Sandboxed iframe has an opaque Origin; it possesses only its bounded
        # URL capability, never the parent document's MOS storage or cookies.
        if origin not in (None, 'null', self.config['origin']):
            raise Blocked('forbidden')
        websocket = request.headers.get('Upgrade', '').lower() == 'websocket'
        path = stream_path(request.match_info['path'], request.method, websocket)
        headers = {'X-MOS-Owner': self.config['owner_id'],
                   'X-MOS-Generation': self.config['generation'],
                   'X-MOS-Stream-Role': slot['role']}
        url = self.config['stream_origin'] + '/stream' + path
        if websocket:
            role = slot['role']
            async with self.client.ws_connect(url, ssl=self.ssl, headers=headers, max_msg_size=8 * 1024 * 1024) as upstream:
                downstream = web.WebSocketResponse(max_msg_size=1024 * 1024)
                await downstream.prepare(request)
                await relay(downstream, upstream, lambda: alive() and slot['role'] == role)
                return downstream
        async with self.client.get(url, ssl=self.ssl, headers=headers, allow_redirects=False) as upstream:
            data = await bounded_body(upstream)
            if upstream.status != 200:
                raise Blocked('streamUnavailable')
            if path == '/':
                # Selkies expects Web Storage. Give the opaque frame ephemeral
                # preferences only, never access to the parent's MOS storage.
                bootstrap = b'''<script>(()=>{for(const name of ['localStorage','sessionStorage']){const values=new Map();Object.defineProperty(window,name,{value:{getItem:key=>values.get(String(key))??null,setItem:(key,value)=>values.set(String(key),String(value)),removeItem:key=>values.delete(String(key)),clear:()=>values.clear(),key:index=>Array.from(values.keys())[index]??null,get length(){return values.size}}});}})();</script>'''
                if b'<head>' not in data:
                    raise Blocked('streamUnavailable')
                data = data.replace(b'<head>', b'<head>' + bootstrap, 1)
            return web.Response(body=data, content_type=upstream.content_type, headers={
                'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
                'Access-Control-Allow-Origin': 'null',
                'Content-Security-Policy': "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'self'; sandbox allow-scripts allow-pointer-lock",
            })


def stream_agent(config, home):
    client = None
    async def lifetime(app):
        nonlocal client
        client = ClientSession(trust_env=False)
        yield
        await client.close()
        home.close()

    async def handle(request):
        if request.headers.get('X-MOS-Owner') != config['owner_id'] or request.headers.get('X-MOS-Generation') != config['generation']:
            raise Blocked('forbidden')
        home.check()
        role = request.headers.get('X-MOS-Stream-Role')
        if role not in ('controller', 'viewer'):
            raise Blocked('forbidden')
        password = os.environ['SELKIES_BASIC_AUTH_PASSWORD' if role == 'controller' else 'SELKIES_BASIC_AUTH_VIEWONLY_PASSWORD']
        auth = BasicAuth('matt', password)
        websocket = request.headers.get('Upgrade', '').lower() == 'websocket'
        path = stream_path(request.match_info['path'], request.method, websocket)
        url = 'http://127.0.0.1:18031' + path
        if websocket:
            async with client.ws_connect(url, auth=auth, headers={'Origin': 'http://127.0.0.1:18031'}, max_msg_size=8 * 1024 * 1024) as upstream:
                downstream = web.WebSocketResponse(max_msg_size=1024 * 1024)
                await downstream.prepare(request)
                await relay(downstream, upstream)
                return downstream
        async with client.get(url, auth=auth, allow_redirects=False) as upstream:
            data = await bounded_body(upstream)
            return web.Response(body=data, status=upstream.status, content_type=upstream.content_type)

    from service import errors
    app = web.Application(middlewares=[errors])
    app.cleanup_ctx.append(lifetime)
    app.router.add_get('/stream/{path:.*}', handle)
    return app
