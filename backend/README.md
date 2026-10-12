# Personal services — scoped deployment, partial acceptance

The selected MOS matt account maps to existing LXC matt UID/GID1001. Configure
its verified stable API ID from private deployment records, not a browser field.
Host matt UID1000 remains non-login. Neither account is modified. The bridge
contains no host-management or shell endpoint; terminal execution stays in LXC.

## Run tests

On an ordinary Linux development user, create a virtual environment, install
`requirements.txt`, then run `python -m unittest -v` from this directory (or
root `npm run test:backend` with that environment active). GitHub's build also
runs these Linux tests in its own disposable virtualenv, never against MOS.
Tests create disposable Home directories and certificates, real PTYs and HTTPS
servers. The MOS profile fixture tests policy, not live MOS integration.
`preflight.py <expected-pool-UUID>` is a read-only MOS-host check; supply the
reviewed UUID from private deployment records. It never changes configuration.

## Deployment inputs and explicit approval gate

Installation, new listeners, certificates and reverse-proxy routing are **not
authorized by source implementation alone**. The selected homelab deployment has
separate user approval; nothing here installs automatically;
the existing frontend-only Debian packaging does not include this service.

Agent config is a protected JSON file with `owner_id`, `generation`, `home`,
`uid`, `device`, `mount_id`, `listen`, `port`, `certificate`, `key`, `bridge_ca`.
Require UID1001, real `/home/matt` mount and approved pool before configuring
its current device/mount identity. Hardened systemd services have namespace-local
mount IDs. For those, admission also records `home_inode` and `home_mount_root`;
the agent checks device/inode, exact mountpoint/root and Btrfs type before pinning
the visible mount ID. After reboot, trusted admission must re-inspect runtime
device identity; stale admission blocks instead of accepting another mount.
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
Personal views share an80ms request-start budget; the bridge also spaces profile
checks by80ms across clients, retaining authentication on every operation without
caching grants or changing MOS's20/s limiter. Upstream429 remains rateLimited,
not unauthenticated; other upstream failures return backendUnavailable. Output
reads back off for one second on rate limiting. Terminal input is never replayed.

`mos-desktop-agent.service` is installed and enabled in the approved LXC. It runs
as existing matt, requires the real Home mount and bounds its
processes/memory. An ordinary service stop ends owned PTYs; disconnect does not.
Host bridge supervision/ingress must use MOS's inspected startup lifecycle, not
assume systemd on the NAS. Keep LXC autostart off until recovery is accepted.

MOS rebuilds its root filesystem on boot. Retain Python venv Debian packages and
missing dependencies in `/boot/optional/packages`; validate exact base-version
compatibility before installing them with dpkg. The reviewed startup script
installs those packages before services. Runtime, configuration, private CA and
keys live in root-only persistent storage outside the container's Home bind,
not on the `/boot` filesystem (which cannot support venv symlinks).
A short `/boot/optional/scripts/post-start.sh` invokes the bounded bridge startup
hook after pools/network/services exist. Preserve existing scripts when adding
the hook. Verify expected pool UUID and protected directory ownership before
using its code/keys. Nginx routes only the exact personal-operation endpoint and
verifies the loopback bridge certificate; HTTP is rejected. Validate configuration
before graceful reload, retaining the original for rollback. No host reboot was
performed; this is configuration/lifecycle evidence, not full reboot acceptance.
LXC autostart remains off. After a future reboot/manual container start, stale
admission may require trusted reinspection before restarting this agent/bridge;
never bypass that check or infer successful automatic recovery.

## Protocol and scope

POST JSON `{operation,args}` to the bridge. Server supplies owner/generation.
Agent endpoint `/v1/operation` requires mTLS and matching owner/generation.
Health, list, read, top-level mkdir and bounded atomic new-file write/upload;
terminal list, create, attach, detach, output, input, resize, end are allowlisted.
The original installed PTY agent remains unchanged to preserve running sessions.
A files-only instance of the same agent code provides nested mkdir/write, move,
trash/list/restore. Configure `files_only:true`, a separate mTLS port, and the
bridge's trusted `files_backend_origin`; terminal requests retain backend_origin.
The files-only instance rejects all terminal operations.
Files/requests max1MiB/2MiB; paths max32components; listings page200 and cursor
max10000; four PTYs,1MiB replay each; eight concurrent requests,8second bridge
deadline. These are service bounds, not a filesystem quota against the user shell.

File reads reject traversal, encoded ambiguity, symlinks, extra mount crossings,
special files and hardlinks. Linux openat2 is mandatory. Top-level writes use
the pinned Home root handle, fsync a mode0600 staging file, atomically publish,
then fsync Home. Save As uses renameat2 NOREPLACE and preserves originals.
Existing-file Save requires the SHA256 version returned by read: immediately
before replacement, the safe read must match or return conflict (including a
missing target). Replacement creates a new mode0600 inode. This is optimistic
conflict detection, not compare-and-swap: a terminal/native writer can still race
between the check and rename. The user explicitly accepted this limitation.
Nested mutations execute in short-lived ordinary-user workers. Parent handles
use openat2; Landlock ABI3+ is optional additional protection when available. Atomic
NOREPLACE moves never fall back to copy/delete. Only one root is currently admitted;
no second mount/root was invented for cross-root testing. Trash fsyncs an original
location receipt before moving the payload into reserved `.mos-desktop-trash`.
Restore never overwrites conflicts; interrupted moves retain discoverable receipts
and payloads. No permanent deletion or automatic purge exists.
The explicitly approved Tier1 contract uses validated paths and ordinary matt
permissions, not adversarial native-reparent containment. A concurrent native
writer can move an already-open parent outside Home before a mutation; no stronger
isolation is claimed. Traversal, symlink resolution, hardlinks and mount crossings
remain rejected. MOS nested/move/trash/restore, conflicts and interrupted-trash
tests now pass without Landlock. Stronger containment is future hardening.

Installed files service: `/opt/mos-desktop/files-backend`, configuration
`/etc/mos-desktop/files-agent.json`, unit `mos-desktop-files.service`, port18446.
Reuse the agent unit with that code/config path; enable only after verifying UID,
Home admission and visible mounts. It uses the existing TLS identity/bridge CA.
Source code is root-owned and separate from user Home. Restart only this files
unit for updates/recovery; the original agent and PTYs are intentionally retained.
Effective LXC systemd drop-ins override NoNewPrivileges and several kernel/control
protection flags. ProtectSystem=strict and User=matt remain effective; do not infer
full unit hardening from the base file. No broad host pool binds were observed in
the agent mount namespace; approved `/home/matt` remains the sole personal root.

Terminal output is base64 bytes with sequence/gap/exited metadata. Input is
bounded and returns accepted byte count; never automatically replay uncertain
input. One view controls input/resize for15seconds, renewed on control traffic;
explicit takeover is supported. Polling reauthenticates each operation. Logout
invalidates client access, but MOS currently does not revoke an otherwise valid
JWT server-side; MOS-wide revocation is optional future hardening under Tier1.
No PTY survival across service restart is promised: old IDs fail, files survive.
Browser layout stores only validated session/generation references under the
existing identity fence. Refresh reattaches that reference without creating a
shell; an expired input lease or explicit takeover is still required for control.

## Consumer checks and remaining live gates

Root `npm run test:personal-ui` starts/stops its own loopback development server
and dedicated headless browser, exercising Home Save As/conflict and xterm input,
detach, reattach and confirmed End against an explicit HTTP fixture. It does not
use MOS credentials or replace real backend acceptance. `npm test` retains the
existing suite and includes credential-fenced personal/document adapter tests.
The separate `tests/editor-host-integration.mjs` takes BATTLEMOON_EDITOR_MODULE
from the compiled editor DOM entry and mounts real CodeMirror with host-injected
Open/Save/Save As. The installed Personal Editor now passes these operations,
reopening and stale-conflict edit retention against MOS. The SDK owns editor
mechanics; only its minified compiled artifact, hashes and dependency notices are
shipped. This is not Battle native editor input acceptance.

Live owner/non-owner admission, real scoped files/PTYs, service restarts, approved
TLS ingress and installed Home/Terminal browser workflows pass. Run dedicated
owner auth first with `MOS_TEST_ACCOUNT=matt`, then `node tests/personal-live.cjs`.
It uses real UI input and retains a unique small canary file; it does not restart
services or end other sessions. Add MOS_TEST_PRESENTATION=standalone to run the
same real service workflows through the same-origin standalone entry. Both runs
exercise480 actual keystrokes, complete echo delivery and retained input control.
The other presentation updates the same canary to verify real cross-view conflicts.
Nested file policy is now verified under the revised single-owner Tier1 contract.
`MOS_TEST_ACCOUNT=matt node tests/personal-nested-live.cjs` exercises installed
nested folders/write/move/trash/restore/refresh using actual UI interactions.
### On-demand Home backup

`backup-home.sh` is a root-admin, fixed-path backup helper, not a browser API.
Installed helper: `/mnt/user/mos-desktop/services/backup-home.sh`.
Run with `sh /mnt/user/mos-desktop/services/backup-home.sh` on MOS.
It checks the source/destination filesystem UUIDs and translated Home owner,
copies only admitted Home to `/mnt/Apps/home-backup/mos-desktop/<UTC timestamp>`,
and verifies content/metadata against both the live source and an isolated full
restore copy. Backup directories are root-only; the enclosing folder is unchanged.
No scheduled execution, purge, live restore, or service interruption is added.
Incomplete copies remain `.partial` and are not accepted. This is a live file
backup, not an application-consistent snapshot or a backup of service keys/config.
The 2026-10-12 backup and isolated restore passed on separate device `/dev/sdb1`;
the original Home uses `/dev/nvme0n1p2`. Both copies are retained, about 2 GiB total.

Full host reboot/rollback remains untested; safe preflight is configuration proof
only. Native Battle/human media-quality checks remain separate; Landlock and
MOS-wide JWT revocation no longer block the homelab completion point.

## Approved Selkies installation and scoped streaming

User approval covers installation in this LXC, not extra host permissions,
identity changes or unrelated services. The supplied2.0.0 AppImage SHA256 is
`8dcdbe239dc8930545819aae510c45283cf25922250b6b7348ff2fd790c41ed8`.
It is extracted under `/opt/selkies-8dcdbe239dc8`. The launcher uses the bundled
executable directly, not AppRun's unauthenticated display startup. LXC-only
dependencies are Xvfb, x11-apps, openbox, x11-utils and their resolved libraries.
These persist in container rootfs; no MOS host package/account was changed.
The private X display uses Xauthority, no TCP listener, CPU/JPEG capture and no
GPU/uinput grant.

`mos-desktop-stream.service` owns Xvfb/Openbox/xedit/Selkies as existing matt.
Selkies listens only on127.0.0.1:18031. `mos-desktop-stream-agent.service` is a
separate mTLS proxy with existing owner/generation/Home admission on18445.
Separate code lives under `/opt/mos-desktop/streaming-backend`; existing personal
agent/PTY processes are not restarted. Protected stream.env holds random native
controller/viewer passwords, never MOS credentials. Native Selkies enforces the
view-only ceiling. Commands, clipboard, uploads, public sharing, audio,
microphone, camera and gamepad input are disabled/locked. Shared viewer support
is enabled only to permit the authenticated second view.

Bridge stream_origin is one fixed HTTPS origin. Authenticated stream.attach
issues a random256-bit capability for up to four views. Fresh MOS profile checks
renew its20-second lease. This is bounded lease authentication, not per-frame
MOS verification or JWT revocation. Takeover demotes/ disconnects old controllers;
the frontend remounts when roles change. Closing/disconnecting a view does not
terminate the native application.

The persistent nginx hook adds HTTPS-only `^~ /desktop-stream/`, with access logs
and buffering disabled, MOS credentials/cookies stripped, verified bridge TLS
and WebSocket upgrades. Generic static asset regex routes must not override it.
The opaque sandbox cannot read parent MOS storage. Ephemeral in-frame Web Storage
supplies preferences only. Capability URLs are neither persisted nor logged.
The fixed transport allowlist excludes file/upload/command APIs.

Installed0.2.14 browser checks pass native mouse/keyboard Save, viewer denial,
takeover/old-controller denial, forbidden APIs/origins, iframe storage isolation,
disconnect/reconnect, offline/online recovery and refresh/relaunch. Native xedit
PID stays unchanged. Real mTLS no-certificate rejection and wrong-owner403 pass.
Audio stays disabled; the upstream client emits an AudioDecoder-unavailable
warning in the opaque sandbox, but JPEG/input works. No audio, hardware-encoding,
host-reboot or subjective media-quality acceptance is implied.
Run MOS_TEST_ACCOUNT=matt and MOS_STREAM_TEST=1 with
`npx playwright test tests/e2e/stream.spec.cjs`. Existing root@mos SSH is used only
for read-only canary/PID assertions. Tests retain unique canaries, never end PTYs.
Native input checks use20ms key spacing and150ms after remote editing shortcuts.
A zero-delay automation burst raced native cursor movement and split a marker;
maximum-rate native input ordering/subjective responsiveness is not accepted.
