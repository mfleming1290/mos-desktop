"""Owned real PTYs; detach is not process termination."""
import asyncio
import base64
import collections
import fcntl
import os
import signal
import struct
import subprocess
import termios
import time
import uuid

from home import Blocked


class Terminals:
    def __init__(self, home, generation, capacity=4, replay_bytes=1024 * 1024):
        self.home, self.generation = home, generation
        self.capacity, self.replay_bytes = capacity, replay_bytes
        self.sessions = {}

    def create(self, owner):
        self.home.check()
        # Exited sessions are bounded too; stale references never silently respawn.
        if len(self.sessions) >= self.capacity:
            raise Blocked('capacityExceeded')
        master, slave = os.openpty()

        def setup():
            os.setsid()
            fcntl.ioctl(slave, termios.TIOCSCTTY, 0)

        try:
            process = subprocess.Popen(['/bin/bash', '--noprofile', '--norc'],
                                       stdin=slave, stdout=slave, stderr=slave,
                                       cwd=self.home.path, close_fds=True,
                                       preexec_fn=setup,
                                       env={'HOME': self.home.path, 'USER': 'matt',
                                            'LOGNAME': 'matt', 'TERM': 'xterm-256color',
                                            'PATH': '/usr/local/bin:/usr/bin:/bin',
                                            'LANG': 'C.UTF-8'})
        except BaseException:
            os.close(master)
            raise
        finally:
            os.close(slave)
        os.set_blocking(master, False)
        key = str(uuid.uuid4())
        session = {'id': key, 'owner': owner, 'process': process, 'fd': master,
                   'chunks': collections.deque(), 'bytes': 0, 'sequence': 0,
                   'controller': None, 'lease': 0, 'closed': False}
        self.sessions[key] = session
        asyncio.get_running_loop().add_reader(master, self._read, session)
        return {'id': key, 'generation': self.generation}

    def _read(self, session):
        try:
            data = os.read(session['fd'], 16384)
        except BlockingIOError:
            return
        except OSError:
            data = b''
        if not data:
            self._close_fd(session)
            session['process'].poll()
            return
        session['sequence'] += 1
        session['chunks'].append((session['sequence'], data))
        session['bytes'] += len(data)
        while session['bytes'] > self.replay_bytes and session['chunks']:
            _, removed = session['chunks'].popleft()
            session['bytes'] -= len(removed)

    def _close_fd(self, session):
        if not session['closed']:
            asyncio.get_running_loop().remove_reader(session['fd'])
            os.close(session['fd'])
            session['closed'] = True

    def owned(self, owner, key):
        session = self.sessions.get(key)
        if session is None or session['owner'] != owner:
            raise Blocked('forbidden')
        return session

    def list(self, owner):
        return [{'id': key, 'exited': value['process'].poll() is not None}
                for key, value in self.sessions.items() if value['owner'] == owner]

    def attach(self, owner, key, view, takeover=False):
        session = self.owned(owner, key)
        if not isinstance(view, str) or not 1 <= len(view) <= 128:
            raise Blocked('invalidView')
        now = time.monotonic()
        if session['lease'] <= now or session['controller'] == view or takeover:
            session['controller'], session['lease'] = view, now + 15
        return {'controller': session['controller'] == view,
                'exited': session['process'].poll() is not None}

    def detach(self, owner, key, view):
        session = self.owned(owner, key)
        if session['controller'] == view:
            session['controller'], session['lease'] = None, 0

    def control(self, owner, key, view):
        self.home.check()
        session = self.owned(owner, key)
        if (session['controller'] != view or session['lease'] <= time.monotonic()
                or session['closed'] or session['process'].poll() is not None):
            raise Blocked('controlRequired')
        session['lease'] = time.monotonic() + 15
        return session

    def input(self, owner, key, view, data):
        session = self.control(owner, key, view)
        if not isinstance(data, bytes) or len(data) > 4096:
            raise Blocked('capacityExceeded')
        try:
            written = os.write(session['fd'], data)
        except BlockingIOError:
            written = 0
        # Caller must not automatically retry uncertain or partial input.
        return {'acceptedBytes': written}

    def resize(self, owner, key, view, columns, rows):
        if type(columns) is not int or type(rows) is not int or not (
                2 <= columns <= 500 and 2 <= rows <= 300):
            raise Blocked('invalidSize')
        session = self.control(owner, key, view)
        fcntl.ioctl(session['fd'], termios.TIOCSWINSZ, struct.pack('HHHH', rows, columns, 0, 0))

    def output(self, owner, key, after):
        session = self.owned(owner, key)
        if type(after) is not int or after < 0 or after > session['sequence']:
            raise Blocked('invalidSequence')
        chunks = session['chunks']
        first = chunks[0][0] if chunks else session['sequence'] + 1
        return {'sequence': session['sequence'], 'gap': after < first - 1,
                'data': base64.b64encode(b''.join(data for seq, data in chunks if seq > after)).decode(),
                'exited': session['process'].poll() is not None}

    async def end(self, owner, key):
        session = self.owned(owner, key)
        process = session['process']
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGHUP)
            for _ in range(20):
                if process.poll() is not None:
                    break
                await asyncio.sleep(.05)
        if process.poll() is None:
            return {'exited': False}  # no implicit force-kill of user jobs
        self._close_fd(session)
        del self.sessions[key]
        return {'exited': True}

    async def shutdown(self):
        # Only service-owned PTYs; graceful service stop honestly ends sessions.
        for key, session in list(self.sessions.items()):
            await self.end(session['owner'], key)
            if key in self.sessions:
                os.killpg(session['process'].pid, signal.SIGKILL)
                session['process'].wait()
                self._close_fd(session)
                del self.sessions[key]
