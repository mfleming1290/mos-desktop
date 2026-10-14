"""Opt-in host-owned connector authority. Discovery never evaluates code.

Configured roots must be outside personal Home and writable only by the bridge
operator. No filesystem path is accepted from a browser. Installation is separate.
"""
import base64
import hashlib
import json
import os
import re
import stat
import tempfile
from pathlib import Path
from contextlib import contextmanager

ID = re.compile(r'^[A-Za-z0-9_.-]{1,80}$')
DECISIONS = {'approved', 'rejected', 'disabled', 'revoked'}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def parse(data):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result or key in ('__proto__', 'constructor', 'prototype'):
                raise ValueError('duplicate or unsafe JSON field')
            result[key] = value
        return result
    return json.loads(data, object_pairs_hook=unique)


def checked(path, directory=False):
    path = Path(path).absolute()
    for parent in reversed([path, *path.parents]):
        info = parent.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(parent, 'is_junction', lambda: False)():
            raise ValueError('symlink denied')
    info = path.stat()
    if directory:
        if not stat.S_ISDIR(info.st_mode):
            raise ValueError('directory required')
    elif not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
        raise ValueError('regular single-link file required')
    return path


def read(path, limit):
    path = checked(path)
    # Refuse symlink swaps at final open; compare opened identity to inspection.
    before = path.stat()
    fd = os.open(path, os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0))
    try:
        info = os.fstat(fd)
        if (info.st_dev, info.st_ino) != (before.st_dev, before.st_ino):
            raise ValueError('artifact changed')
        with os.fdopen(fd, 'rb', closefd=False) as source:
            data = source.read(limit + 1)
        if len(data) > limit:
            raise ValueError('artifact capacity exceeded')
        return data
    finally:
        os.close(fd)


class ConnectorAuthority:
    def __init__(self, discovery, authority, scope):
        self.discovery = checked(discovery, True)
        self.root = checked(authority, True)
        if os.name == 'posix' and (self.root.stat().st_mode & 0o022 or self.root.stat().st_uid != os.geteuid()):
            raise ValueError('authority must be owned by bridge and not group/world writable')
        if self.discovery == self.root or self.discovery in self.root.parents or self.root in self.discovery.parents:
            raise ValueError('separate discovery and authority required')
        self.scope = scope
        self.path = self.root / 'approvals.json'
        self.last = {'version': 1, 'revision': 0, 'scope': scope, 'records': {}}

    def load(self):
        if not self.path.exists():
            return self.last
        value = parse(read(self.path, 262144))
        if (set(value) != {'version', 'revision', 'scope', 'records'} or value['version'] != 1 or
                value['scope'] != self.scope or type(value['revision']) is not int or value['revision'] < self.last['revision'] or
                not isinstance(value['records'], dict) or len(value['records']) > 256):
            raise ValueError('unsupported approval state; writes disabled')
        for key, record in value['records'].items():
            if (not ID.fullmatch(key) or set(record) != {'identity', 'decision', 'version', 'manifestSha256', 'moduleSha256', 'context', 'requestedCapabilities', 'approvedCapabilities'} or
                    not all(isinstance(record[k], str) and re.fullmatch('[a-f0-9]{64}', record[k]) for k in ('identity', 'manifestSha256', 'moduleSha256')) or
                    not isinstance(record['version'], str) or not ID.fullmatch(record['version']) or record['context'] != 'isolated-frame' or
                    record['requestedCapabilities'] != [] or record['approvedCapabilities'] != [] or record['decision'] not in DECISIONS):
                raise ValueError('invalid approval record')
        self.last = value
        return value

    @contextmanager
    def transaction(self):
        lock = self.root / 'approval.lock'
        fd = os.open(lock, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            yield
        finally:
            os.close(fd)
            lock.unlink()

    def artifact(self, folder):
        if not ID.fullmatch(folder):
            raise ValueError('invalid connector directory')
        directory = checked(self.discovery / folder, True)
        manifest_bytes = read(directory / 'manifest.json', 16384)
        m = parse(manifest_bytes)
        if (set(m) != {'id', 'version', 'abi', 'context', 'capabilities', 'moduleSha256'} or
                not isinstance(m['id'], str) or not ID.fullmatch(m['id']) or len(m['id']) > 70 or not ID.fullmatch(m['version']) or type(m['abi']) is not int or m['abi'] != 1 or
                m['context'] != 'isolated-frame' or m['capabilities'] != [] or
                not re.fullmatch('[a-f0-9]{64}', m['moduleSha256'])):
            raise ValueError('unsupported connector manifest/context/capabilities')
        code = read(directory / 'adapter.mjs', 65536)
        code.decode('utf-8', errors='strict')
        if digest(code) != m['moduleSha256']:
            raise ValueError('module hash mismatch')
        return {'manifest': m, 'identity': digest(manifest_bytes + b'\0' + code),
                'manifestSha256': digest(manifest_bytes), 'code': code, 'manifestBytes': manifest_bytes}

    def scan(self):
        found, conflicts, diagnostics = {}, set(), []
        for i, folder in enumerate(self.discovery.iterdir()):
            if i >= 256:
                raise ValueError('connector count exceeded')
            try:
                item = self.artifact(folder.name)
                key = item['manifest']['id']
                if key in found:
                    conflicts.add(key)
                found[key] = item
            except (ValueError, OSError, TypeError, KeyError) as error:
                diagnostics.append(folder.name + ': ' + str(error))
        for key in conflicts:
            found.pop(key, None)
            diagnostics.append(key + ': duplicate connector id')
        return found, diagnostics

    def list(self):
        try:
            state = self.load()
            writable, recovery = True, ''
        except (ValueError, OSError, TypeError, KeyError) as error:
            state, writable, recovery = self.last, False, str(error)
        found, diagnostics = self.scan()
        return {'revision': state['revision'], 'records': state['records'], 'writable': writable, 'recovery': recovery,
                'diagnostics': diagnostics, 'connectors': [dict(manifest=v['manifest'], identity=v['identity'],
                 manifestSha256=v['manifestSha256'], decision=(state['records'].get(k, {}).get('decision', 'pending')
                 if state['records'].get(k, {}).get('identity') == v['identity'] else 'pending')) for k, v in sorted(found.items())]}

    def decide(self, identifier, identity, decision, expected):
        if decision not in DECISIONS:
            raise ValueError('invalid decision')
        with self.transaction():
            state = self.load()
            if type(expected) is not int or expected != state['revision']:
                raise ValueError('approval revision conflict')
            found, _ = self.scan()
            if identifier not in found or found[identifier]['identity'] != identity:
                raise ValueError('artifact changed/conflicting/missing')
            records = dict(state['records'])
            item = found[identifier]
            records[identifier] = {'identity': identity, 'decision': decision, 'version': item['manifest']['version'],
                                   'manifestSha256': item['manifestSha256'], 'moduleSha256': item['manifest']['moduleSha256'],
                                   'context': 'isolated-frame', 'requestedCapabilities': [], 'approvedCapabilities': []}
            candidate = dict(state, revision=expected + 1, records=records)
            data = json.dumps(candidate, sort_keys=True).encode()
            # Publication must preserve the same bounds enforced by load().
            # Historical approvals are retained, never silently pruned for space.
            if len(records) > 256 or len(data) > 262144:
                raise ValueError('approval capacity exceeded; previous state retained')
            # Immutable recovery copies are retained; unsupported originals are never reset.
            if self.path.exists():
                backup = self.root / ('approvals.' + digest(read(self.path, 262144)) + '.json')
                if not backup.exists():
                    with backup.open('xb') as output:
                        output.write(read(self.path, 262144))
            temp = self.root / 'approval.next'
            with temp.open('xb') as output:
                output.write(data)
                output.flush()
                os.fsync(output.fileno())
            os.replace(temp, self.path)
            if os.name == 'posix':
                fd = os.open(self.root, os.O_RDONLY | os.O_DIRECTORY)
                try:
                    os.fsync(fd)
                finally:
                    os.close(fd)
            self.last = candidate
            return self.list()

    def activate(self, identifier, identity, expected):
        with self.transaction():
            state = self.load()
            record = state['records'].get(identifier, {})
            if type(expected) is not int or expected != state['revision'] or record.get('identity') != identity or record.get('decision') != 'approved':
                raise ValueError('activation not approved')
            found, _ = self.scan()
            if identifier not in found or found[identifier]['identity'] != identity:
                raise ValueError('artifact changed/conflicting/missing')
            item = found[identifier]
            stage = self.root / identity
            if not stage.exists():
                candidate = Path(tempfile.mkdtemp(prefix='stage-', dir=self.root))
                for name, data in [('manifest.json', item['manifestBytes']), ('adapter.mjs', item['code'])]:
                    with (candidate / name).open('xb') as output:
                        output.write(data)
                        output.flush()
                        os.fsync(output.fileno())
                    (candidate / name).chmod(0o400)
                candidate.rename(stage)
            code, manifest = read(stage / 'adapter.mjs', 65536), read(stage / 'manifest.json', 16384)
            if digest(manifest + b'\0' + code) != identity:
                raise ValueError('staged artifact corrupted')
            return {'identity': identity, 'revision': state['revision'], 'context': 'isolated-frame',
                    'module': base64.b64encode(code).decode(), 'manifest': item['manifest']}


if __name__ == '__main__':
    # Operator and GUI use the same validated CAS transaction, never direct editing.
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('discovery')
    parser.add_argument('authority')
    parser.add_argument('scope')
    parser.add_argument('--decision', choices=sorted(DECISIONS))
    parser.add_argument('--id')
    parser.add_argument('--identity')
    parser.add_argument('--revision', type=int)
    args = parser.parse_args()
    host = ConnectorAuthority(args.discovery, args.authority, args.scope)
    print(json.dumps(host.decide(args.id, args.identity, args.decision, args.revision) if args.decision else host.list()))
