"""Disposable real authority server for browser proof; no MOS/service deployment.

The browser auth/profile and personal services remain fixtures. Approval, files,
CAS and staging use the actual host implementation in a temporary directory.
"""
import hashlib
import json
import sys
import tempfile
import base64
import re
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
sys.path.insert(0, str(Path(__file__).parent.parent / 'backend'))
from connectors import ConnectorAuthority

temp = tempfile.TemporaryDirectory()
root = Path(temp.name)
discovery, authority = root / 'discovery', root / 'authority'
discovery.mkdir()
authority.mkdir()
folder = discovery / 'canary'
folder.mkdir()
code = b'''parent.postMessage({kind:'canary-evaluated'},'*');
export function createContentHost({target}) {return {async attach(identity,signal) {
 const input=document.createElement('textarea');input.setAttribute('aria-label','Installed draft');target.append(input);
 const status=document.createElement('output');target.append(status);
 return {code:'attached',attachment:{active(value){status.textContent=value?'active':'inactive'},resize(b){input.style.width=Math.max(1,b.width-20)+'px'},detach(){input.remove();status.remove()}}};
}};}'''
(folder / 'adapter.mjs').write_bytes(code)
(folder / 'manifest.json').write_text(json.dumps(dict(id='canary', version='1', abi=1, context='isolated-frame', capabilities=[], moduleSha256=hashlib.sha256(code).hexdigest())))
host = ConnectorAuthority(discovery, authority, 'fixture-owner')
manifests = root / 'manifests'
manifests.mkdir()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(sys.argv[1].encode())

    def do_POST(self):
        try:
            request = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            op, args = request['operation'], request.get('args', {})
            if op == 'connector.list':
                result = host.list()
            elif op == 'fixture.manifests':
                for file in manifests.iterdir():
                    file.unlink()
                for name, value in args['files'].items():
                    if not re.fullmatch('[A-Za-z0-9_.-]+\\.json', name):
                        raise ValueError('invalid fixture filename')
                    (manifests / name).write_text(json.dumps(value))
                result = {}
            elif op == 'list' and args.get('path') == 'Applications/manifests':
                result = {'entries': [dict(name=p.name, kind='file', size=p.stat().st_size) for p in manifests.iterdir()], 'next': None}
            elif op == 'read' and args.get('path', '').startswith('Applications/manifests/'):
                name = args['path'].removeprefix('Applications/manifests/')
                if not re.fullmatch('[A-Za-z0-9_.-]+\\.json', name):
                    raise ValueError('invalid fixture filename')
                data = (manifests / name).read_bytes()
                if len(data) > args.get('maxBytes', 16384):
                    raise ValueError('capacityExceeded')
                result = {'data': base64.b64encode(data).decode()}
            elif op == 'connector.decide':
                result = host.decide(args['id'], args['identity'], args['decision'], args['revision'])
            elif op == 'connector.activate':
                result = host.activate(args['id'], args['identity'], args['revision'])
            else:
                raise ValueError('forbidden')
            self.send_response(200)
        except Exception:
            result = {'error': 'forbidden'}
            self.send_response(403)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())


HTTPServer(('127.0.0.1', 18049), Handler).serve_forever()
