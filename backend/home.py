"""Bounded Linux Home operations. No realpath/open fallback."""
import ctypes
import errno
import hashlib
import os
import secrets
import stat

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

    def open(self, path, flags, mode=0, root=False, base=None):
        self.check()
        value = relative(path, root).encode('utf-8')
        # x86_64/aarch64 Linux syscall 437; no alternate unsafe implementation.
        how = How(flags | os.O_CLOEXEC | os.O_NOFOLLOW | os.O_NONBLOCK, mode,
                  0x08 | 0x04 | 0x02 | 0x01)  # BENEATH, NO_SYMLINKS/MAGICLINKS/XDEV
        fd = self.libc.syscall(437, self.fd if base is None else base,
                               ctypes.c_char_p(value), ctypes.byref(how), ctypes.sizeof(how))
        if fd < 0:
            error = ctypes.get_errno()
            if error in (errno.ENOSYS, errno.EINVAL, errno.ELOOP, errno.EXDEV):
                raise Blocked('containmentUnavailable')
            raise OSError(error, os.strerror(error))
        st = os.fstat(fd)
        if not (stat.S_ISREG(st.st_mode) or stat.S_ISDIR(st.st_mode)) or (
                stat.S_ISREG(st.st_mode) and st.st_nlink != 1):
            os.close(fd)
            raise Blocked('unsupportedType')
        return fd

    def read(self, path):
        fd = self.open(path, os.O_RDONLY)
        try:
            if not stat.S_ISREG(os.fstat(fd).st_mode):
                raise Blocked('unsupportedType')
            chunks, size = [], 0
            while size <= LIMIT:
                chunk = os.read(fd, min(65536, LIMIT + 1 - size))
                if not chunk:
                    break
                chunks.append(chunk)
                size += len(chunk)
            data = b''.join(chunks)
            if len(data) > LIMIT:
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
        self.check()
        relative(path)
        if '/' in path:
            raise Blocked('topLevelOnly')
        os.mkdir(path, mode=0o700, dir_fd=self.fd)
        os.fsync(self.fd)

    def write(self, path, data, expected):
        self.check()
        relative(path)
        if len(data) > LIMIT:
            raise Blocked('capacityExceeded')
        if expected is not None:
            raise Blocked('saveCopyRequired')
        if '/' in path:
            raise Blocked('topLevelOnly')
        fd, name = self.fd, path
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
            result = self.libc.renameat2(fd, temporary.encode(), fd, name.encode(), 1)
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
