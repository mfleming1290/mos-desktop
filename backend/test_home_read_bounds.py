"""Real openat2 bounded-read proof; no aiohttp dependency or live Home."""
import os
from pathlib import Path
import tempfile
import unittest
from home import Home, Blocked


@unittest.skipUnless(os.name == 'posix', 'Linux openat2 required')
class ReadBounds(unittest.TestCase):
    def test_manifest_limit_and_default_compatibility(self):
        with tempfile.TemporaryDirectory() as scratch:
            path = Path(scratch)
            fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
            try:
                mount = next(line.split()[1] for line in Path(f'/proc/self/fdinfo/{fd}').read_text().splitlines() if line.startswith('mnt_id:'))
            finally:
                os.close(fd)
            home = Home(str(path), os.geteuid(), path.stat().st_dev, mount)
            try:
                (path / 'manifest.json').write_bytes(b'x' * 16384)
                self.assertEqual(len(home.read('manifest.json', 16384)[0]), 16384)
                (path / 'manifest.json').write_bytes(b'x' * 16385)
                with self.assertRaises(Blocked):
                    home.read('manifest.json', 16384)
                self.assertEqual(len(home.read('manifest.json')[0]), 16385)
                for invalid in (0, -1, True, 1048577, '16384'):
                    with self.assertRaises(Blocked):
                        home.read('manifest.json', invalid)
                (path / 'link').symlink_to(path / 'manifest.json')
                with self.assertRaises(Blocked):
                    home.read('link', 16384)
            finally:
                home.close()


if __name__ == '__main__':
    unittest.main()
