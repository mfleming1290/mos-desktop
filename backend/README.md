# Personal services — local candidate, not deployed

The selected MOS matt account maps to existing LXC matt UID/GID1001. Configure
its verified stable API ID from private deployment records, not a browser field.
Host matt UID1000 remains non-login. Neither account is modified. The bridge
contains no host-management or shell endpoint; terminal execution stays in LXC.

## Run tests

On an ordinary Linux development user, create a virtual environment, install
`requirements.txt`, then run `python -m unittest -v` from this directory.
Tests create disposable Home directories and certificates, real PTYs and HTTPS
servers. The MOS profile fixture tests policy, not live MOS integration.
`preflight.py <expected-pool-UUID>` is a read-only MOS-host check; supply the
reviewed UUID from private deployment records. It never changes configuration.

## Deployment inputs and explicit approval gate

Installation, new listeners, certificates and reverse-proxy routing are **not
authorized by source implementation**. Nothing here installs automatically;
the existing frontend-only Debian packaging does not include this service.

Agent config is a protected JSON file with `owner_id`, `generation`, `home`,
`uid`, `device`, `mount_id`, `listen`, `port`, `certificate`, `key`, `bridge_ca`.
Require UID1001, real `/home/matt` mount and approved pool before configuring
its current device/mount identity. `mount_id` is runtime-specific: after a reboot,
trusted admission must re-inspect it; a stale value blocks rather than silently
accepting another mount. A fixed filesystem identity alone is not sufficient.
Use a dedicated CA admitting only the bridge's client certificate.

Bridge config contains `owner_id`, `generation`, exact HTTPS `origin`,
`mos_origin`, `backend_origin`, `listen`, `port`, `certificate`, `key`,
`backend_ca`, `bridge_certificate`, `bridge_key`. Keep bridge client keys outside
the LXC and Home. Certificates/keys must be protected; never commit them.
Configure same-origin HTTPS routing for POST `/desktop-api/v1/operation`.
No arbitrary upstream, redirect following, CORS wildcard or certificate bypass.
Each call verifies current `/api/v1/auth/profile` and exact account ID/name;
boot/admin tokens lacking an actual owner profile are not personal grants.
Browser credentials are forwarded only to MOS, never to the agent. Bearer auth
plus exact Origin is mandatory. No additional cookie-authenticated mode exists.

`mos-desktop-agent.service` is a proposed LXC systemd unit, **not installed or
enabled**. It runs as existing matt, requires the real Home mount and bounds its
processes/memory. An ordinary service stop ends owned PTYs; disconnect does not.
Host bridge supervision/ingress must use MOS's inspected startup lifecycle, not
assume systemd on the NAS. Keep LXC autostart off until recovery is accepted.

## Protocol and scope

POST JSON `{operation,args}` to the bridge. Server supplies owner/generation.
Agent endpoint `/v1/operation` requires mTLS and matching owner/generation.
Health, list, read, top-level mkdir and bounded atomic new-file write/upload;
terminal list, create, attach, detach, output, input, resize, end are allowlisted.
No delete/trash is exposed, so no operation silently deletes user documents.
Files/requests max1MiB/2MiB; paths max32components; listings page200 and cursor
max10000; four PTYs,1MiB replay each; eight concurrent requests,8second bridge
deadline. These are service bounds, not a filesystem quota against the user shell.

File reads reject traversal, encoded ambiguity, symlinks, extra mount crossings,
special files and hardlinks. Linux openat2 is mandatory. Writes create only new
top-level files through the pinned Home root handle, fsync staging, publish with
renameat2 NOREPLACE, then fsync Home. Existing files are never overwritten; even
an expected version returns saveCopyRequired. Nested mutation and rename are
unavailable, avoiding parent-directory relocation and native-writer compare/replace
races. Save As creates a new copy and preserves the original. This deliberately
narrow supported policy is not full original M3 file/edit acceptance; overwrite,
nested mutation and move remain unmet requirements. No deployment flag bypasses it.

Terminal output is base64 bytes with sequence/gap/exited metadata. Input is
bounded and returns accepted byte count; never automatically replay uncertain
input. One view controls input/resize for15seconds, renewed on control traffic;
explicit takeover is supported. Polling reauthenticates each operation. Logout
invalidates client access, but MOS currently does not revoke an otherwise valid
JWT server-side; full access revocation on MOS logout remains an integration gate.
No PTY survival across service restart is promised: old IDs fail, files survive.

## Consumer checks and remaining live gates

Root `npm run test:personal-ui` starts/stops its own loopback development server
and dedicated headless browser, exercising Home Save As/conflict and xterm input,
detach, reattach and confirmed End against an explicit HTTP fixture. It does not
use MOS credentials or replace real backend acceptance. `npm test` retains the
existing suite and includes credential-fenced personal/document adapter tests.
The separate `tests/editor-host-integration.mjs` takes BATTLEMOON_EDITOR_MODULE
from the reviewed SDK DOM entry and mounts real CodeMirror with host-injected
Open/Save As. That seam is not an installed MOS editor window or Battle native
input acceptance. The SDK package still owns editor mechanics and its artifact.

Full file/edit policy, logout revocation, live non-owner and owner admission,
installed service restart/rollback, approved ingress and frontend Home/Terminal
mounts remain unaccepted. NAS reboot is not performed for testing; safe preflight
checks establish configuration only. Streaming cannot qualify until admission is
accepted and Selkies installation in this LXC is separately approved. STREAM2
retains its full STREAM1 dependency; no new display or unrelated service is started.
