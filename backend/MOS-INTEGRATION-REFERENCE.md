# MOS-native integration reference

Investigated 2026-10-12. Consumer: MOS Desktop; reusable for other MOS plugins.
Acceptance update: the owner subsequently approved Tier1 path validation and
ordinary LXC matt permissions without race-proof containment. The historical
blocker assessment below is not the current delivery gate: nested operations are
now enabled and verified; Landlock and MOS-wide JWT revocation are future hardening.
See this directory's AGENTS.md and README.md for current deployment/limits.
Read `mos-full` documentation first, then traced the supplied `mos-nas` code.
This is static source verification, not certification of MOS security or a new
live deployment test. No MOS services, accounts, kernel or security settings were
changed. Existing live acceptance remains owned by `../VALIDATION.md`.

## Evidence roots and freshness

- Documentation: `E:/My Drive/knowledge/mos-full/` (D below).
- Source: `E:/My Drive/knowledge/mos-nas/` (S below).
- Each source location below is relative to S and includes inspected line ranges.
  Short `services/...`, `routes/...` and `src/...` API references resolve under
  `mos-api/src/`, `mos-api/src/` and `mos-api/` respectively.
  Documentation metadata cites API7281c011, frontendfa41c831 and rootfs2099a664;
  those are recorded snapshot references, not independently verified current
  upstream or installed versions. Recheck sources before adopting changed APIs.
- Documentation distinguishes source-derived implementation notes from original
  website instructions; neither proves live readiness. Particularly useful D
  guides: `implementation/api/{authentication-and-tokens,users-and-profiles,
  terminal-and-file-operations}.md`, `implementation/boot/startup-lifecycle.md`,
  `implementation/lxc/{service-images-and-lifecycle,backups-snapshots-and-restore}.md`.

## Findings that affect the original Work Ladder

| Capability | Native mechanism | Reuse decision / remaining gate |
|---|---|---|
| Nested personal file containment | Admin file browser with optional caller-provided virtual roots | Not a security substitute; retain fail-closed workers |
| JWT logout invalidation | Client token deletion, no server revocation | Native user JWT revocation remains unresolved |
| Persistent host dependencies | Optional `.deb` reinstall during MOS startup | Reuse; already used by bridge deployment |
| LXC startup | Persistent directory bind plus separately delayed autostart | Reuse controls, verify readiness separately; do not enable autostart silently |
| Recovery / backup | Container stop, optional snapshot, archive and restart | Not non-disruptive acceptance; external Home bind needs separate backup |
| Personal execution | Host tools inherit root; MOS Linux accounts intentionally non-login | Keep authenticated MOS identity separate from existing LXC execution identity |

No examined native mechanism safely removes the current nested-write or JWT
revocation blocker. Revisited Phase1, dependent full STREAM2, editor/native and
closeout gates: existing verified subsets stand; kernel/security changes,
disruptive recovery, backup destination choice and human native/media evidence
remain prerequisites. No independent implementation was newly unblocked.

## Files: frontend -> route -> backend

`mos-frontend/src/views/mosTools/filebrowser.vue:603,641,782,840` calls deletion,
folder creation, copy/move and rename. `mos-api/src/routes/mos.routes.js:636`
requires admin; handlers at5897,5783,7025,5560 dispatch to the services below.
The API init declares root and starts Node under it:
`mos-rootfs/rootfs_files/etc/init.d/api:14-20,57-60`.

- `mos-api/src/routes/mos.routes.js:6524-6550` takes navigator roots from query
  input. `services/mos.service.js:6684-6709` optionally checks those roots and
  otherwise browses the full filesystem; `6880-6883` is a lexical path-prefix
  predicate. This is admin UI navigation policy, not an independently admitted
  per-user grant or pinned-descriptor/symlink/mount boundary.
- `services/mos.service.js:6440-6499` validates a new basename, checks paths and
  renames by pathname. `7314-7344,7369-7395` creates files/folders recursively,
  then invokes ownership/mode commands; defaults are500:500 and777. These are
  not existing-LXC-matt execution or race-safe scoped operations.
- `services/fileoperations.service.js:35-89,134-148` resolves paths, performs
  separate existence/conflict checks and then ordinary `fs.rename`. The check
  is not atomic NOREPLACE; concurrent changes can invalidate it. EXDEV falls
  through to rsync; `191-216` adds `--remove-source-files` for moves and only
  applies skip flags on that branch. Do not import this as no-loss move policy.
- The same service stores operations in memory (`12-23,92-125`). MergerFS rules
  (`349-415`) prevent certain same-pool copies; they do not confine access to a
  personal root. Cancellation/restart is not transactional rollback.
- `services/mos.service.js:7499-7541` deletes with rmdir/rm/unlink, including
  recursive permanent deletion. It is not recoverable trash. Do not wire these
  endpoints into the authorized trash-only workflow.

Reuse the UI/progress vocabulary if useful, not its privileged backend policy.
No containment helper using openat2/RESOLVE_BENEATH/Landlock was found in the
searched JavaScript/shell/config surface; this bounded search is not proof of
absence from every binary dependency.

## Authentication, invalidation and privilege separation

Frontend logout clears localStorage (`mos-frontend/src/App.vue:375-395`).
`mos-api/src/routes/auth.routes.js:855-865` explicitly tells clients to delete
their JWT and performs no revocation. Middleware
`src/middleware/auth.middleware.js:64-151` accepts boot token, active admin token,
then verifies JWT signature/expiry, current user existence and unchanged role.
There is no session epoch/revocation lookup in that JWT path. Password update is
not proof that previously issued JWTs have been revoked.

- `services/user.service.js:749-764,796-807` provides persisted active/deactivated
  admin tokens. This is a genuinely revocable credential class, but it represents
  admin authority, not the selected matt user session. Do not substitute it or
  create one merely to satisfy logout acceptance.
- Middleware `17-61,86-105,155-171` scopes permanent tokens by first API path
  segment and HTTP method, while boot/admin tokens bypass role checks. `mos`
  write permission is not a single plugin operation capability. Trace ordered
  router middleware, not just the leaf endpoint.
- `mos-api/src/services/user.service.js:927-930` deliberately creates Linux accounts using
  `useradd -g 500 -M -s /bin/false`. Missing host
  Home and blocked interactive login are expected, not a provisioning defect.
  Account persistence is `user.service.js:876-890` plus rootfs `init:218-227`.
  Keep host matt and existing LXC matt unchanged.
- Terminal UI `mosTools/webterminal.vue:60-165` -> `/terminal/create`
  (`routes/terminal.routes.js:357`) -> `services/terminal.service.js:37-95`:
  PTY spawn has no lower uid/gid override and inherits privileged API execution.
  `websockets/terminal.websocket.js:426-454` kills a session after its last client
  disconnects. Both privilege and detach semantics differ from MOS Desktop.

Continue using MOS profile authentication and narrow owner admission. Short
stream leases/client fencing are useful but do not create MOS JWT revocation.

## Kernel dependency: not an optional-package omission

`mos-kernel/kernel-config/config:6875-6880` disables SECURITY/SECURITYFS and
selects default DAC on x86. In contrast `config_arm:11311-11345,11398` enables
SECURITY, Landlock and an LSM list containing landlock. Architecture matters.
The x86 workflow copies that config and compiles a kernel image
(`.github/workflows/build_kernel.yml:68-86`); it is not a runtime plugin toggle.

This source explains a plausible build-level cause of the previously recorded
MOS ENOSYS result; it does not independently prove the exact running image was
built from this snapshot. Adding userspace `.deb` dependencies does not change
this checked-in kernel configuration. A supported rebuilt kernel/LSM activation
or a separately reviewed equivalent is still needed before enabling mutations.
Do not run kernel CI scripts on MOS: the workflow removes build-host module and
firmware directories (`49-54`). Kernel changes/reboot require separate approval.

## Persistence, startup and service recovery

`mos-rootfs/rootfs_files/usr/local/bin/mos-start:533-582` is the actual ordered
startup owner. Early plugin installation precedes storage and optional packages;
optional packages precede workload services, API and nginx. `135-141` runs dpkg
twice over `/boot/optional/packages/*.deb`, with output suppressed. Packages are
installed through dpkg; the older claim that they are not tracked by dpkg should
not be copied into integration instructions. Reinstallation is what restores
them after rootfs reconstruction, not runtime apt installation alone.

- `mount_remotes:318-323` and LXC autostart `226-237` are asynchronous.
  `start_autostart_plugins:516-531,575` also runs in the background. Post-start
  `47-59,577-582` and `/run/mos-booted` do not prove every container/remote ready.
  Reuse the hook but retain explicit mount, identity and service health checks.
- `mos-lxc/etc/init.d/lxc:41-77` validates inferred backing mount, binds configured
  storage to `/var/lib/lxc`, links persistent default config, and chmods the LXC
  directory777. Its ordinary start function `28-33` does not start containers;
  `mos-rootfs/rootfs_files/usr/local/bin/mos-lxc_autostart:1-9` waits and invokes lxc-containers start.
- LXC UI `mos-frontend/src/views/lxc.vue:459,484,703` ->
  `mos-api/src/routes/lxc.routes.js:224,340-347,395,451` ->
  `services/lxc.service.js:458-515` delegates to LXC commands with active-operation
  guards. Command completion is not application readiness. Autostart writer
  `879-900` changes `lxc.start.auto`; preserve current off setting.
- Unprivileged creation `lxc.service.js:602-705,912-949` defaults false and appends
  mappings to100000. Mapping setup failure is caught as a warning. Preserve and
  inspect actual existing200000 mappings, not UI labels/defaults; never rerun
  this helper over the admitted container.
- Network defaults are macvlan (`mos-boot-files/config/system/lxc/default.conf:1-4`).
  Starting lxc-net alone does not rewrite existing container network configuration.

MOS init/start-stop-daemon mechanisms provide startup, not a demonstrated
per-plugin crash supervisor. Keep current scoped in-container service recovery;
do not restart global LXC/API/nginx services merely for acceptance testing.

## Backups and restore: do not use as harmless probes

`mos-frontend/src/views/lxc/lxcBackups.vue:280-428` calls LXC backup/snapshot APIs.
`mos-api/src/services/lxc.service.js:2162-2244` admits an asynchronous backup;
`2251-2340` stops a running container first, then optionally snapshots and restarts
it before compression. Archive source is the container directory/snapshot, not
independent contents of external bind mounts. A success response is not a
completed or verified Home backup.

`lxc.service.js:2743-2794` stops/destroys an existing restore target before backing
validation/extraction. Recovery is not atomic replacement. Preserve running
PTYs, choose an approved separate Home backup destination, and schedule any
disruptive tests separately. Native backup support does not unblock those gates.

## Plugin integration rules worth reusing

`mos-frontend/src/composables/usePlugins.ts:55-105` uses the host stored bearer and
loads `/_plugins/<name>/remoteEntry.js` into the shared Vue host. A normal plugin
is trusted host UI, not a sandbox; untrusted streams need separate isolation.
`mos-api/src/services/plugins.service.js:111-192` restricts query executable names
and arguments but runs a Bash command under API authority. This is not a personal
filesystem/process sandbox. Settings `1735-1793` use basename checks and ordinary
JSON writes, not versioned conflict-safe personal-document storage.

Reuse MOS discovery, numeric-version Debian packaging and persistent settings
for trusted plugin policy. Keep root-only bootstrap code separate from user Home;
do not expose generic query/functions endpoints through the personal bridge.
Boot selects the latest numeric version (`mos-rootfs/rootfs_files/usr/local/bin/mos-start:516-529`), so
version directories/template/frontend assets must be reconciled together.

## Revalidation anchors

SHA256 of inspected local files (not signatures or installed-host attestation):

```text
dd81b040ecb8b9bfa55beccb3cd3d36f623543c59b60d959f36d37288f1bccda  mos-kernel/kernel-config/config
19f037811bfd632ae774bec3af8ca822b542435c3c974e83966cf04ad2fd3703  mos-api/src/middleware/auth.middleware.js
836fd7c3e0e0faf9a92444848518353361529cba2dd831eeaa4e7da5d409845c  mos-api/src/services/fileoperations.service.js
939d227a5dce3c4b2585ce2c3d8ac9cc10cbc63764e59cef80748a99b1e666f4  mos-rootfs/rootfs_files/usr/local/bin/mos-start
```

When a source snapshot or deployed MOS version changes -> retrace the affected
frontend/route/service boundary and rerun scoped runtime checks before adoption.
No new implementation or live acceptance is claimed by this reference.

## Wayland and shared GPU streaming requirements

Research refreshed 2026-10-13; source/documentation evidence only. Current NVIDIA
MOS host and future AMD RX7800XT host are separate machines. Do not infer the
current machine's GPU or installed driver from the AMD Sealskin screenshots.

- Version-specific [Selkies2.0.0 native documentation](https://github.com/selkies-project/selkies/blob/2.0.0/docs/native.md)
  describes the AppImage as carrying Python, pixelflux and the web client, but
  depending on the execution environment's libgbm, libEGL, GPU driver and
  libwayland-server. It supports its own headless Wayland session with
  `--wayland=true`; `h264enc` selects hardware where available and `--use-cpu=true`
  explicitly prevents that. Therefore the installed2.0.0 AppImage is a plausible
  reusable engine, not a sufficient GPU/compositor deployment by itself. Inspect
  its bundled pixelflux version and runtime help before using newer flags.
- Current [Selkies desktop requirements](https://github.com/selkies-project/selkies/blob/main/docs/components/desktop-image.md)
  require successful GBM/EGL renderer initialization on an accessible DRM render
  node. NVIDIA additionally needs its graphics driver libraries; a visible node
  alone does not establish acceleration. Docker's toolkit flags are injection
  recipes, not instructions to install Docker/toolkit into our LXC. AMD uses
  VAAPI and its Mesa vendor driver; NVIDIA uses NVENC and matching NVIDIA
  userspace libraries. Keep these vendor dependencies local to deployment.
- [pixelflux main README](https://github.com/selkies-project/pixelflux#usage)
  identifies its built-in Smithay compositor, direct application Wayland socket,
  GPU dmabuf-to-encoder path and vendor-aware render-node selection. Rendering and
  encoding must resolve to the same GPU for the intended zero-copy path. These
  moving-main capabilities are not independently verified in our AppImage.
- [LinuxServer's September25 release article](https://www.linuxserver.io/blog/webtop-5-0-and-selkies-2-0-everything-everywhere-all-in-one-release)
  describes Selkies2.0.0/pixelflux2.1.0, patched labwc/wlroots or KWin for its desktop
  images, NVIDIA driver580+/toolkit1.20.1+, and modeset-device requirements. Its
  proprietary-Xorg/NvFBC path owns a card exclusively and is unsuitable here;
  its shared Wayland approach is the donor. Those image-specific defaults do not
  prove the same compositor packages or driver injection exist in our LXC.

Minimum NVIDIA canary: inventory the real host GPU/loaded driver, node ownership
and existing users; inspect runtime libraries and current admission; then, only
within approved device scope, run renderer/encoder initialization as LXC matt in
a separate socket/port and prove actual NVENC H.264 plus browser input and Save.
Native xedit needs an explicitly verified Xwayland route or a separate native
Wayland test app; changing a capture flag cannot migrate the existing Xvfb app.
Keep the working X11 unit/app untouched until replacement acceptance. Verify
takeover, disconnect/reconnect, resource isolation and persistent startup before
switching. No device grant, driver change or live GPU acceptance is established
by this research; no privileged container, whole-/dev bind, exclusive assignment,
kernel changes or host-wide permission changes are implied. Missing driver or
modeset access beyond the approved boundary requires a concrete scoped decision.

### Verified NVIDIA LXC application, 2026-10-13

The approved container restart activated exact renderD129, nvidia0, nvidiactl
and nvidia-uvm binds while preserving the unprivileged idmap and ordinary matt.
Matching615.71.09 userspace libraries needed libnvcuvid as well as libnvidia-encode;
missing NVCUVID initially made NVENC fail to load. GBM_BACKEND=nvidia-drm,
GBM_BACKENDS_PATH, private EGL vendor/external-platform JSON selection and
XKB_CONFIG_ROOT=/usr/share/X11/xkb were needed by this extracted AppImage.
Without the XKB override, its build-machine keymap path caused compositor startup
failure. These are deployment observations, not generic MOS defaults.

Ordinary-user FFmpeg encoded60 H264 frames; pixelflux opened its Wayland socket with
the NVIDIA GL renderer. Real stream journals identify zero-copy Wayland capture
encoded in place on NVENC. `backend/run-wayland-session.sh` is the source owner;
backend/AGENTS.md owns exact private deployment locations and rollback.
Rootful Xwayland -shm supplies existing xedit without physical display ownership.
Pin compositor/Xwayland to1280x720 and scale locally: automatic compositor resize
stretched the fixed rootful surface. Installed browser11 passes aspect ratio,
native Save, ownership and recovery; this is not measured FPS/subjective latency.

Second-server HTTPS and isolated owner login pass. Configured root@apps.aeyth
SSH returns Permission denied(publickey,password), so AMD provisioning is blocked
pending authorized SSH access, not web credentials or a GPU diagnosis. Do not
change authentication policy or repurpose MOS login passwords to bypass it.

### Second MOS deployment verified, 2026-10-13

The correct second SSH target is aos.aeyth; apps.aeyth is the owner's legacy Arch
connection. Actual MOS mounts differed: /mnt/home and /mnt/data, with persistent
/var/lib/lxc backed by /mnt/data/system/lxc and no /mnt/user. A fresh mapped
container uses this host's existing100000 subordinate range, not the first host's
200000 range. User-selected /mnt/home/mos-desktop/home is the only personal bind;
exact AMD renderD128 and required TUN are separate device grants. Host accounts,
drivers and unrelated workloads remained unchanged.

Fresh profile discovery, Tailscale enrollment, CA/generation and inspected Home
device/inode/mount-root were required; copying a working config would have copied
the wrong owner, paths, identity map and TLS admission. Installed browser11 and
embedded/standalone Home/editor/terminal/nested workflows now pass against the real
second services. Journals identify zero-copy Wayland capture encoded on VA-API;
actual streamed Save and role/recovery tests pass, not merely startup rendering.
Files/stream-agent/bridge restart preserves an existing PTY and native xedit.

Python package compatibility is also host-specific: second host Python3.13u3 does
not satisfy the repository's current python3.13-venv u5 exact dependency. Its base
venv module was already present, so venv --without-pip plus the compatible Debian
pip wheel bootstrapped persistent service dependencies without a host Python upgrade.
Only pure pip/setuptools wheel packages were installed/retained for boot. When
creating container virtualenvs from a privileged bootstrap with umask077 -> use
readable/executable permissions for non-secret runtime packages; private TLS files
retain0640. Initial203/EXEC failures were permissions, not a reason to weaken units.

Plugin persistence follows the inspected native layout: numeric version directory,
reviewed plugin.config.js and immutable Debian payload under /boot/optional/plugins,
plus matching base template.json (plugins.service.js:922-984). The second installation
verified the existing0.2.14 payload hash before dpkg and retained it for MOS boot.
Exact HTTPS bridge/stream routes use guarded post-start restoration and nginx
validation/graceful reload. Owner later enabled autostart1. Actual host reboot
recovered container/services/bridge/Tailscale/Home, but exposed a persistence trap:
the ephemeral nginx configuration was reset while its original backup persisted.
An assertion that the backup must not exist aborted route restoration. Backup
creation must be conditional; a persistent backup is not a reason to skip restoring
ephemeral state. The corrected hook preserves that backup and restores exact routes.
Actual post-boot replay and isolated recreated-config/repeated-call regression pass;
A subsequent owner reboot confirmed automatic web-route recovery without intervention;
all11 browser checks and both personal presentations/nested workflows passed afterward.
backend/AGENTS.md owns current deployment locations and verification limits.
