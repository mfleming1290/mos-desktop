"""Fixed-purpose personal service and MOS authentication bridge."""
import argparse
import asyncio
import base64
import json
import os
import ssl
from pathlib import Path
from urllib.parse import urlsplit

from aiohttp import ClientError, ClientSession, ClientTimeout, TCPConnector, web
from home import Blocked, Conflict, Home, LIMIT
from terminal import Terminals

OPERATIONS = frozenset(('health', 'list', 'read', 'mkdir', 'write', 'move', 'trash', 'trash.list', 'restore', 'terminal.create',
                        'terminal.list', 'terminal.attach', 'terminal.detach', 'terminal.output',
                        'terminal.input', 'terminal.resize', 'terminal.end'))


def capacity_gate():
    active = 0

    @web.middleware
    async def bounded(request, handler):
        nonlocal active
        if active >= 8:
            return web.json_response({'error': 'capacityExceeded'}, status=429)
        active += 1
        try:
            return await handler(request)
        finally:
            active -= 1
    return bounded


@web.middleware
async def errors(request, handler):
    try:
        response = await handler(request)
    except Conflict:
        response = web.json_response({'error': 'conflict'}, status=409)
    except Blocked as error:
        code = str(error)
        response = web.json_response({'error': code}, status=403 if code == 'forbidden' else 422)
    except FileNotFoundError:
        response = web.json_response({'error': 'notFound'}, status=404)
    except FileExistsError:
        response = web.json_response({'error': 'conflict'}, status=409)
    except PermissionError:
        response = web.json_response({'error': 'permissionDenied'}, status=403)
    except (ValueError, TypeError, KeyError, UnicodeError):
        response = web.json_response({'error': 'invalidRequest'}, status=400)
    except (OSError, ClientError, asyncio.TimeoutError):
        response = web.json_response({'error': 'backendUnavailable'}, status=503)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response


def agent_app(config, home):
    terminals = Terminals(home, config['generation'])
    lock = asyncio.Lock()

    async def dispatch(request):
        # TLS layer authenticates the bridge. Body identity is accepted only there.
        value = await request.json()
        if not isinstance(value, dict) or not isinstance(value.get('args', {}), dict):
            raise ValueError('invalidRequest')
        if (value.get('owner') != config['owner_id'] or
                value.get('generation') != config['generation']):
            raise Blocked('forbidden')
        op, args = value['operation'], value.get('args', {})
        if op not in OPERATIONS:
            raise Blocked('forbidden')
        if config.get('files_only') and op.startswith('terminal.'):
            raise Blocked('forbidden')
        if op.startswith('terminal.') and args.get('generation', config['generation']) != config['generation']:
            raise Blocked('forbidden')
        home.check()
        owner = config['owner_id']
        async with lock:
            if op == 'health':
                result = {'protocol': 1, 'generation': config['generation'],
                          'files': True, 'writeMode': 'optimisticTopLevel',
                          'nestedMutations': True,
                          'containment': 'validatedPaths',
                          'delete': False, 'terminal': not config.get('files_only', False), 'uid': os.geteuid()}
            elif op == 'list':
                cursor = args.get('cursor', 0)
                if type(cursor) is not int or not 0 <= cursor <= 10000:
                    raise Blocked('capacityExceeded')
                result = home.list(args.get('path', ''), cursor)
            elif op == 'read':
                data, version = home.read(args['path'])
                result = {'data': base64.b64encode(data).decode(), 'version': version}
            elif op == 'mkdir':
                home.mkdir(args['path'])
                result = {}
            elif op == 'write':
                data = base64.b64decode(args['data'], validate=True)
                result = {'version': home.write(args['path'], data, args['expected'])}
            elif op == 'move':
                result = home.move(args['path'], args['destination'])
            elif op == 'trash':
                result = home.trash(args['path'])
            elif op == 'trash.list':
                result = home.trash_list()
            elif op == 'restore':
                result = home.restore(args['id'])
            elif op == 'terminal.create':
                result = terminals.create(owner)
            elif op == 'terminal.list':
                result = {'sessions': terminals.list(owner)}
            elif op == 'terminal.attach':
                result = terminals.attach(owner, args['id'], args['view'], args.get('takeover') is True)
            elif op == 'terminal.detach':
                terminals.detach(owner, args['id'], args['view'])
                result = {}
            elif op == 'terminal.output':
                result = terminals.output(owner, args['id'], args['after'])
            elif op == 'terminal.input':
                result = terminals.input(owner, args['id'], args['view'],
                                         base64.b64decode(args['data'], validate=True))
            elif op == 'terminal.resize':
                terminals.resize(owner, args['id'], args['view'], args['columns'], args['rows'])
                result = {}
            else:
                result = await terminals.end(owner, args['id'])
        return web.json_response(result)

    async def cleanup(app):
        await terminals.shutdown()
        home.close()

    app = web.Application(middlewares=[errors, capacity_gate()], client_max_size=2 * LIMIT)
    app.router.add_post('/v1/operation', dispatch)
    app.on_cleanup.append(cleanup)
    return app


def secure_url(value):
    parsed = urlsplit(value)
    if (parsed.scheme != 'https' or not parsed.hostname or parsed.username or
            parsed.password or parsed.query or parsed.fragment or parsed.path not in ('', '/')):
        raise ValueError('fixed HTTPS origin required')
    return value.rstrip('/')


def bridge_app(config, backend_ssl):
    origin = secure_url(config['origin'])
    mos = secure_url(config['mos_origin'])
    backend = secure_url(config['backend_origin'])
    files_backend = secure_url(config['files_backend_origin']) if config.get('files_backend_origin') else backend
    client = None
    profile_gate = asyncio.Lock()
    next_profile = 0
    streams = None

    async def lifetime(app):
        nonlocal client, streams
        client = ClientSession(timeout=ClientTimeout(total=8),
                               connector=TCPConnector(limit=8), trust_env=False)
        if config.get('stream_origin'):
            from streaming import StreamGateway
            config['stream_origin'] = secure_url(config['stream_origin'])
            streams = StreamGateway(config, client, backend_ssl)
        yield
        await client.close()

    async def dispatch(request):
        nonlocal next_profile
        if request.headers.get('Origin') != origin:
            raise Blocked('forbidden')
        authorization = request.headers.get('Authorization', '')
        if not authorization.startswith('Bearer ') or len(authorization) > 8192:
            return web.json_response({'error': 'unauthenticated'}, status=401)
        # Always recheck current MOS identity; never decode an unverified JWT.
        # Share the budget across tabs/clients. Do not cache authentication or
        # change MOS's limiter; leave headroom for ordinary dashboard requests.
        async with profile_gate:
            loop = asyncio.get_running_loop()
            await asyncio.sleep(max(0, next_profile - loop.time()))
            next_profile = loop.time() + .08
        async with client.get(mos + '/api/v1/auth/profile',
                              headers={'Authorization': authorization},
                              allow_redirects=False) as response:
            if response.status == 429:
                return web.json_response({'error': 'rateLimited'}, status=429,
                                         headers={'Retry-After': '1'})
            if response.status in (401, 403):
                return web.json_response({'error': 'unauthenticated'}, status=401)
            if response.status != 200:
                return web.json_response({'error': 'backendUnavailable'}, status=503)
            if response.content_length and response.content_length > 65536:
                raise Blocked('forbidden')
            raw = await response.content.read(65537)
            if len(raw) > 65536:
                raise Blocked('forbidden')
            profile = json.loads(raw)
        if (str(profile.get('id')) != config['owner_id'] or
                profile.get('username') != 'matt' or profile.get('role') not in ('user', 'admin')):
            raise Blocked('forbidden')
        value = await request.json()
        if not isinstance(value, dict) or not isinstance(value.get('args', {}), dict):
            raise ValueError('invalidRequest')
        if streams and value.get('operation') in ('stream.attach', 'stream.detach'):
            method = streams.attach if value['operation'] == 'stream.attach' else streams.detach
            return web.json_response(await method(value.get('args', {}), authorization))
        if value.get('operation') not in OPERATIONS:
            raise Blocked('forbidden')
        body = {'owner': config['owner_id'], 'generation': config['generation'],
                'operation': value['operation'], 'args': value.get('args', {})}
        # No MOS headers, cookies or caller-selected target reach the backend.
        target = backend if value['operation'].startswith('terminal.') else files_backend
        async with client.post(target + '/v1/operation', json=body,
                               ssl=backend_ssl, allow_redirects=False) as response:
            raw = await response.content.read(2 * LIMIT + 1)
            if len(raw) > 2 * LIMIT:
                raise Blocked('capacityExceeded')
            return web.Response(body=raw, status=response.status, content_type='application/json')

    app = web.Application(middlewares=[errors, capacity_gate()], client_max_size=2 * LIMIT)
    app.cleanup_ctx.append(lifetime)
    app.router.add_post('/desktop-api/v1/operation', dispatch)
    async def stream(request):
        if streams is None:
            raise Blocked('streamUnavailable')
        return await streams.handle(request)
    app.router.add_get('/desktop-stream/{ticket}/{path:.*}', stream)
    return app


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['agent', 'bridge', 'stream-agent'])
    parser.add_argument('config')
    options = parser.parse_args()
    with open(options.config, encoding='utf-8') as source:
        config = json.load(source)
    server_ssl = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    server_ssl.minimum_version = ssl.TLSVersion.TLSv1_2
    server_ssl.load_cert_chain(config['certificate'], config['key'])
    if options.mode in ('agent', 'stream-agent'):
        server_ssl.load_verify_locations(config['bridge_ca'])
        server_ssl.verify_mode = ssl.CERT_REQUIRED
        mount_id = config['mount_id']
        if 'home_inode' in config:
            # systemd's filesystem sandbox has namespace-local mount IDs. Admit
            # the inspected device/inode/mount-root, then pin its local ID.
            info = os.stat(config['home'], follow_symlinks=False)
            if info.st_dev != config['device'] or info.st_ino != config['home_inode']:
                raise Blocked('storageUnavailable')
            mounts = [line.split() for line in Path('/proc/self/mountinfo').read_text().splitlines()]
            fd = os.open(config['home'], os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
            try:
                local_id = next(line.split()[1] for line in Path(f'/proc/self/fdinfo/{fd}').read_text().splitlines() if line.startswith('mnt_id:'))
            finally:
                os.close(fd)
            matches = [entry for entry in mounts if entry[0] == local_id and entry[4] == config['home'] and entry[3] == config['home_mount_root']]
            if len(matches) != 1 or matches[0][matches[0].index('-') + 1] != 'btrfs':
                raise Blocked('storageUnavailable')
            mount_id = int(matches[0][0])
        home = Home(config['home'], config['uid'], config['device'], mount_id)
        if options.mode == 'stream-agent':
            from streaming import stream_agent
            app = stream_agent(config, home)
        else:
            app = agent_app(config, home)
    else:
        backend_ssl = ssl.create_default_context(cafile=config['backend_ca'])
        backend_ssl.load_cert_chain(config['bridge_certificate'], config['bridge_key'])
        app = bridge_app(config, backend_ssl)
    # No access log: credentials, filenames and terminal input are never logged.
    web.run_app(app, host=config['listen'], port=config['port'], ssl_context=server_ssl,
                access_log=None, print=None)


if __name__ == '__main__':
    main()
