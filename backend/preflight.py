"""Read-only MOS diagnostics; does not start, stop, mount or repair anything."""
import json
import os
from pathlib import Path
import subprocess


def command(*args):
    return subprocess.check_output(args, text=True, timeout=10).strip()


def inspect(expected_uuid):
    config = Path('/var/lib/lxc/mos-desktop/config').read_text()
    values = [line.strip() for line in config.splitlines() if line.strip() and not line.lstrip().startswith('#')]
    pid = int(command('lxc-info', '-n', 'mos-desktop', '-pH'))
    uid_map = Path(f'/proc/{pid}/uid_map').read_text().split()
    gid_map = Path(f'/proc/{pid}/gid_map').read_text().split()
    mount = command('findmnt', '-T', '/mnt/user/mos-desktop/home', '-n', '-o', 'TARGET,FSTYPE,UUID').split()
    home = os.stat('/mnt/user/mos-desktop/home')
    namespace = uid_map == ['0', '200000', '65536'] and gid_map == uid_map
    binds = [line.split('=', 1)[1].strip().split() for line in values if line.startswith('lxc.mount.entry')]
    expected = ['/mnt/user/mos-desktop/home', 'home/matt', 'none', 'bind', '0', '0']
    home_bind = expected in binds
    restricted = all(parts[0] in ('/mnt/user/mos-desktop/home', '/dev/net/tun') for parts in binds)
    return {'namespaceMatches': namespace, 'homeBindRequired': home_bind,
            'onlyReviewedBinds': restricted,
            'poolMatches': mount == ['/mnt/user', 'btrfs', expected_uuid],
            'homeOwnershipMatches': (home.st_uid, home.st_gid) == (201001, 201001),
            'manualStart': 'lxc.start.auto = 0' in values,
            'rebootVerified': False, 'changedSystem': False}


if __name__ == '__main__':
    import sys
    try:
        if len(sys.argv) != 2:
            raise ValueError('expected pool UUID required from trusted deployment records')
        print(json.dumps(inspect(sys.argv[1])))
    except (OSError, ValueError, subprocess.SubprocessError):
        print(json.dumps({'ready': False, 'reason': 'inspectionUnavailable', 'changedSystem': False}))
        raise SystemExit(1)
