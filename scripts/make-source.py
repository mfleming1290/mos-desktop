"""Package only reviewed Git source plus MOS checksum files, never local caches."""
from pathlib import Path
import subprocess
import zipfile
import json

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'page/package.json').read_text())['version']
files = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
files = [f for f in files if f]
checksums = sorted((root / 'artifacts').glob(f'desktop_{version}-1+mos-plugin_all.deb.*'))
out = root / 'artifacts' / f'mos-desktop-{version}-source.zip'
with zipfile.ZipFile(out, 'x', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for filename in files:
        info = zipfile.ZipInfo(f'mos-desktop/{filename}', (1980, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, (root / filename).read_bytes())
    for file in checksums:
        info = zipfile.ZipInfo(f'mos-desktop/checksums/{file.name}', (1980, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, file.read_bytes())
assert out.stat().st_size < 10 * 1024 * 1024
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None
print(out.name)
