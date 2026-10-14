"""Bounded Linux Home operations. No realpath/open fallback."""
import ctypes
import errno
import hashlib
import json
import os
import secrets
import stat
import subprocess
import sys

LIMIT = 1024 * 1024


class Blocked(Exception):
    pass


class Conflict(Exception):
    pass


class How(ctypes.Structure):
    _fields_ = [("flags", ctypes.c_uint64), ("mode", ctypes.c_uint64),
                ("resolve", ctypes.c_uint64)]


def relative(path, root=False):
    if not isinstance(path, str) or len(path.encode('utf-8')) > 4096:
        raise Blocked('invalidPath')
    if root and path == '':
        return '.'
    parts = path.split('/')
    if len(parts) > 32 or any(p in ('', '.', '..') for p in parts):
        raise Blocked('invalidPath')
    if any(c in path for c in ('\x00', '\\', '%')):
        raise Blocked('invalidPath')
    if any(p.startswith('.mos-desktop-') for p in parts):
        raise Blocked('reservedPath')
    return path


class Home:
    def __init__(self, path, uid, device, mount_id):
        if os.geteuid() != uid or uid == 0:
            raise Blocked('identityUnsafe')
        self.path = path
        self.fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        self.device, self.mount_id = device, str(mount_id)
        self.uid = uid
        self.libc = ctypes.CDLL(None, use_errno=True)
        try:
            self.check()
            # Require openat2 at startup, before exposing a capability.
            fd = self.open('', os.O_RDONLY | os.O_DIRECTORY, root=True)
            os.close(fd)
        except BaseException:
            os.close(self.fd)
            raise

    def close(self):
        os.close(self.fd)

    def check(self):
        st = os.fstat(self.fd)
        current = os.stat(self.path, follow_symlinks=False)
        with open(f'/proc/self/fdinfo/{self.fd}', encoding='ascii') as info:
            mounts = [line.split()[1] for line in info if line.startswith('mnt_id:')]
        if (st.st_uid != self.uid or st.st_dev != self.device or mounts != [self.mount_id]
                or (st.st_dev, st.st_ino) != (current.st_dev, current.st_ino)):
            raise Blocked('storageUnavailable')

    def open(self, path, flags, mode=0, root=False, base=None, internal=False):
        self.check()
        value = (path if internal else relative(path, root)).encode('utf-8')
        # x86_64/aarch64 Linux syscall 437; no alternate unsafe implementation.
        how = How(flags | os.O_CLOEXEC | os.O_NOFOLLOW | os.O_NONBLOCK, mode,
                  0x08 | 0x04 | 0x02 | 0x01)  # BENEATH, NO_SYMLINKS/MAGICLINKS/XDEV
        fd = self.libc.syscall(437, self.fd if base is None else base,
                               ctypes.c_char_p(value), ctypes.byref(how), ctypes.sizeof(how))
        if fd < 0:
            error = ctypes.get_errno()
            if error in (errno.ENOSYS, errno.EINVAL, errno.ELOOP, errno.EXDEV, errno.ENOTDIR):
                raise Blocked('containmentUnavailable')
            raise OSError(error, os.strerror(error))
        st = os.fstat(fd)
        if not (stat.S_ISREG(st.st_mode) or stat.S_ISDIR(st.st_mode)) or (
                stat.S_ISREG(st.st_mode) and st.st_nlink != 1):
            os.close(fd)
            raise Blocked('unsupportedType')
        return fd

    def read(self, path, limit=LIMIT):
        if type(limit) is not int or not 0 < limit <= LIMIT:
            raise Blocked('capacityExceeded')
        fd = self.open(path, os.O_RDONLY)
        try:
            if not stat.S_ISREG(os.fstat(fd).st_mode):
                raise Blocked('unsupportedType')
            chunks, size = [], 0
            while size <= limit:
                chunk = os.read(fd, min(65536, limit + 1 - size))
                if not chunk:
                    break
                chunks.append(chunk)
                size += len(chunk)
            data = b''.join(chunks)
            if len(data) > limit:
                raise Blocked('capacityExceeded')
            return data, hashlib.sha256(data).hexdigest()
        finally:
            os.close(fd)

    def list(self, path='', cursor=0):
        fd = self.open(path, os.O_RDONLY | os.O_DIRECTORY, root=True)
        try:
            # scandir iterator prevents constructing an unbounded full listing.
            entries = []
            seen = 0
            with os.scandir(fd) as scan:
                for item in scan:
                    if item.name.startswith('.mos-desktop-'):
                        continue
                    if seen >= cursor and len(entries) < 200:
                        st = item.stat(follow_symlinks=False)
                        kind = 'directory' if stat.S_ISDIR(st.st_mode) else (
                            'file' if stat.S_ISREG(st.st_mode) else 'unsupported')
                        entries.append({'name': item.name, 'kind': kind, 'size': st.st_size})
                    seen += 1
                    if seen > cursor + 200:
                        return {'entries': entries, 'next': cursor + 200}
            return {'entries': entries, 'next': None}
        finally:
            os.close(fd)

    def mkdir(self, path):
        if isinstance(path, str) and '/' not in path:
            return self._mkdir(path)
        return self.mutate('mkdir', path=path)

    def write(self, path, data, expected):
        if isinstance(path, str) and '/' not in path:
            return self._write(path, data, expected)
        import base64
        return self.mutate('write', path=path, data=base64.b64encode(data).decode(), expected=expected)

    def move(self, path, destination):
        return self.mutate('move', path=path, destination=destination)

    def trash(self, path):
        return self.mutate('trash', path=path)

    def restore(self, identifier):
        return self.mutate('restore', identifier=identifier)

    def trash_list(self):
        return self.mutate('trash.list')

    def mutate(self, operation, **args):
        # Short-lived workers retain the existing unprivileged identity and
        # openat2 path checks. Landlock is additional protection when available;
        # Tier1 does not promise containment against concurrent native reparenting.
        self.check()
        value = dict(path=self.path, uid=self.uid, device=self.device,
                     mount_id=self.mount_id, operation=operation, args=args)
        result = subprocess.run([sys.executable, '-B', __file__, '--mutation'],
                                input=json.dumps(value), text=True, capture_output=True,
                                timeout=7, check=False)
        if result.returncode:
            raise Blocked('mutationUnavailable')
        answer = json.loads(result.stdout)
        if 'error' in answer:
            kind, message = answer['error']
            if kind == 'os':
                raise OSError(message, os.strerror(message))
            raise (Conflict if kind == 'conflict' else Blocked)(message)
        return answer['result']

    def parent(self, path):
        relative(path)
        directory, _, name = path.rpartition('/')
        return self.open(directory, os.O_RDONLY | os.O_DIRECTORY, root=True), name

    def _mkdir(self, path):
        self.check()
        fd, name = self.parent(path)
        try:
            os.mkdir(name, mode=0o700, dir_fd=fd)
            os.fsync(fd)
        finally:
            os.close(fd)

    def _write(self, path, data, expected):
        self.check()
        relative(path)
        if len(data) > LIMIT:
            raise Blocked('capacityExceeded')
        if expected is not None and (not isinstance(expected, str) or len(expected) != 64
                                     or any(c not in '0123456789abcdef' for c in expected)):
            raise Blocked('invalidVersion')
        fd, name = self.parent(path)
        temporary = '.mos-desktop-save-' + secrets.token_hex(16)
        created = False
        try:
            # Internal staging name is reserved from external callers.
            target = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL |
                             os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=fd)
            created = True
            with os.fdopen(target, 'wb') as out:
                out.write(data)
                out.flush()
                os.fsync(out.fileno())
            if expected is not None:
                # Optimistic check, not a filesystem compare-and-swap: native
                # writers can still race between this read and atomic rename.
                try:
                    current = self.read(path)[1]
                except FileNotFoundError:
                    raise Conflict('conflict') from None
                if current != expected:
                    raise Conflict('conflict')
            self.check()
            result = self.libc.renameat2(fd, temporary.encode(), fd, name.encode(),
                                         1 if expected is None else 0)
            if result != 0:
                error = ctypes.get_errno()
                if error == errno.EEXIST:
                    raise Conflict('conflict')
                raise OSError(error, os.strerror(error))
            created = False
            os.fsync(fd)
            return hashlib.sha256(data).hexdigest()
        finally:
            if created:
                try:
                    os.unlink(temporary, dir_fd=fd)
                except FileNotFoundError:
                    pass
            os.close(fd)

    def rename(self, source_fd, source, target_fd, target):
        if self.libc.renameat2(source_fd, source.encode(), target_fd, target.encode(), 1):
            error = ctypes.get_errno()
            if error in (errno.EEXIST, errno.ENOTEMPTY):
                raise Conflict('conflict')
            # Never emulate EXDEV with copy/delete: source stays intact.
            raise OSError(error, os.strerror(error))
        os.fsync(source_fd)
        os.fsync(target_fd)

    def _move(self, path, destination):
        relative(path)
        relative(destination)
        if path == destination or destination.startswith(path + '/'):
            raise Blocked('invalidDestination')
        probe = self.open(path, os.O_RDONLY)
        os.close(probe)
        source, name = self.parent(path)
        try:
            target, new_name = self.parent(destination)
            try:
                self.rename(source, name, target, new_name)
            finally:
                os.close(target)
        finally:
            os.close(source)
        return {'path': destination}

    def trash_fd(self):
        name = '.mos-desktop-trash'
        try:
            os.mkdir(name, 0o700, dir_fd=self.fd)
            os.fsync(self.fd)
        except FileExistsError:
            pass
        # Internal name is never accepted from the caller.
        fd = self.open(name, os.O_RDONLY | os.O_DIRECTORY, internal=True)
        if os.fstat(fd).st_uid != self.uid:
            os.close(fd)
            raise Blocked('storageUnavailable')
        return fd

    def _trash(self, path):
        relative(path)
        probe = self.open(path, os.O_RDONLY)
        os.close(probe)
        trash = self.trash_fd()
        identifier = secrets.token_hex(16)
        try:
            os.mkdir(identifier, 0o700, dir_fd=trash)
            os.fsync(trash)
            entry = self.open(identifier, os.O_RDONLY | os.O_DIRECTORY, base=trash)
            try:
                # Durable intent precedes the single atomic move. Interrupted
                # intents remain visible; no payload is ever purged automatically.
                fd = os.open('metadata.json', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                             0o600, dir_fd=entry)
                with os.fdopen(fd, 'w') as out:
                    json.dump({'path': path}, out)
                    out.flush()
                    os.fsync(out.fileno())
                os.fsync(entry)
                source, name = self.parent(path)
                try:
                    self.rename(source, name, entry, 'payload')
                finally:
                    os.close(source)
            finally:
                os.close(entry)
        finally:
            os.close(trash)
        return {'id': identifier, 'path': path}

    def trash_entry(self, trash, identifier):
        if not isinstance(identifier, str) or len(identifier) != 32 or any(c not in '0123456789abcdef' for c in identifier):
            raise Blocked('invalidPath')
        fd = self.open(identifier, os.O_RDONLY | os.O_DIRECTORY, base=trash)
        return fd

    def metadata(self, entry):
        fd = self.open('metadata.json', os.O_RDONLY, base=entry)
        try:
            info = os.fstat(fd)
            if not stat.S_ISREG(info.st_mode) or info.st_nlink != 1 or info.st_size > 8192:
                raise Blocked('unsupportedType')
            value = json.loads(os.read(fd, 8193))
            relative(value['path'])
            return value
        finally:
            os.close(fd)

    def _trash_list(self):
        trash = self.trash_fd()
        entries = []
        try:
            with os.scandir(trash) as scan:
                for item in scan:
                    if len(entries) >= 200:
                        raise Blocked('capacityExceeded')
                    entry = self.trash_entry(trash, item.name)
                    try:
                        try:
                            value = self.metadata(entry)
                        except (FileNotFoundError, ValueError, KeyError, TypeError, Blocked):
                            # An interrupted receipt write must not hide other
                            # recoverable entries. Retain everything for review.
                            entries.append({'id': item.name, 'path': '(incomplete receipt)',
                                            'state': 'incompleteReceipt'})
                            continue
                        try:
                            os.stat('payload', dir_fd=entry, follow_symlinks=False)
                            state = 'recoverable'
                        except FileNotFoundError:
                            state = 'completedOrInterrupted'
                        entries.append({'id': item.name, 'path': value['path'], 'state': state})
                    finally:
                        os.close(entry)
        finally:
            os.close(trash)
        return {'entries': entries}

    def _restore(self, identifier):
        trash = self.trash_fd()
        try:
            entry = self.trash_entry(trash, identifier)
            try:
                path = self.metadata(entry)['path']
                target, name = self.parent(path)
                try:
                    self.rename(entry, 'payload', target, name)
                finally:
                    os.close(target)
            finally:
                os.close(entry)
        finally:
            os.close(trash)
        return {'path': path}


def confine(home):
    # Optional extra protection, not the Tier1 admission boundary. All callers
    # still use validated relative paths and openat2; no realpath fallback.
    libc = home.libc
    if libc.syscall(444, 0, 0, 1) < 3:
        return False
    rights = sum(1 << bit for bit in (1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14))
    attr = ctypes.c_uint64(rights)
    rules = libc.syscall(444, ctypes.byref(attr), ctypes.sizeof(attr), 0)
    if rules < 0:
        raise Blocked('mutationUnavailable')
    class Rule(ctypes.Structure):
        _pack_ = 1
        _fields_ = [('access', ctypes.c_uint64), ('parent', ctypes.c_int32)]
    rule = Rule(rights, home.fd)
    try:
        if (libc.syscall(445, rules, 1, ctypes.byref(rule), 0) or
                libc.prctl(38, 1, 0, 0, 0) or libc.syscall(446, rules, 0)):
            raise Blocked('mutationUnavailable')
    finally:
        os.close(rules)
    return True


if __name__ == '__main__' and sys.argv[1:] == ['--mutation']:
    import base64
    try:
        value = json.loads(sys.stdin.read(2 * LIMIT))
        home = Home(value['path'], value['uid'], value['device'], value['mount_id'])
        try:
            confine(home)
            args = value['args']
            operation = value['operation']
            if operation == 'write':
                args['data'] = base64.b64decode(args['data'], validate=True)
            methods = {'mkdir': home._mkdir, 'write': home._write, 'move': home._move,
                       'trash': home._trash, 'trash.list': home._trash_list, 'restore': home._restore}
            answer = {'result': methods[operation](**args)}
        finally:
            home.close()
    except Conflict as error:
        answer = {'error': ['conflict', str(error)]}
    except Blocked as error:
        answer = {'error': ['blocked', str(error)]}
    except OSError as error:
        answer = {'error': ['os', error.errno]}
    except (ValueError, KeyError, TypeError):
        answer = {'error': ['blocked', 'invalidRequest']}
    print(json.dumps(answer))
