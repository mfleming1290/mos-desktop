# MOS Desktop validation — 2026-10-11 UTC

## Live design frontend update — 2026-10-14 UTC

- Owner approved exact0.2.15 frontend candidate on MOS and AOS; installed package,
  persistent version directory and template version/tag now select0.2.15.
  DESIGN-INTEGRATION.md owns exact hash, backups and0.2.14 rollback.
- Live embedded/standalone design smoke passes on both hosts with actual light
  and dark MOS host bindings,44px/8px controls, Library search/launch, editor
  draft/identity preservation across arrangements, Clock and unchanged host bar.
  Four post-login screenshots retained privately; no credential capture.
- Installed layout/auth suite:9 passed and2 opt-in stream tests skipped per host.
  Candidate package/remote entry/design provenance hashes match; recovery archive
  readable and existing settings unchanged where present. Both LXCs/four scoped
  service units remain running. No reboot or backend/permission mutation.
- No new E6/E10/installed E12, stream/native/hardware or boot-recovery acceptance
  inferred. Public numeric release flag remains false; SDK0.4.0 unchanged.

## Final run reconciliation — 2026-10-13 UTC

Both approved MOS hosts provide scoped Home/editor/terminal and authenticated
embedded/standalone access. NVIDIA/NVENC and AMD/VA-API Wayland native Save,
ownership and recovery pass. Owner confirms smoother feel, not measured FPS.
AMD's second owner reboot recovered container, all five services, bridge and web
routes automatically without intervention; Home canary unchanged. Post-boot11
browser tests, both personal presentations/480-key input, nested moves/trash/
restore and mTLS/owner/path boundaries pass. Original-host Home backup/isolated
restore and reboot/manual container recovery remain separately verified.

MOS Tier1 run is complete. The separate Battle development Notes editor mounts,
but native typing automation fails Illegal invocation; human input remains open.
Audio, templates/anchors/edit-lock and stronger hardening are deferred. Earlier
sections are dated history, not current blockers. Public source remains in
mfleming1290/mos-desktop; private operational docs/source backup is in the private
mfleming1290/mos-desktop-private repository. Secrets/auth caches/user data are
excluded from Git; protected live configuration remains on persistent storage.

## Stream settings repair — 2026-10-12 UTC

- Selkies dashboard/core URL-origin messages did not work inside the opaque iframe.
  Gateway now adapts only same-window opaque messages; forged parent settings are
  rejected and parent MOS storage remains inaccessible.
- Live backend confirms CPU JPEG requested60 FPS, quality40/paintover90; browser
  sidebar reflects server settings and browser cursors enabled. Delivered cadence
  and subjective latency are not measured acceptance.
- Passed Node37, layout/auth9 (two owner stream checks skipped in default run),
  explicit owner stream3 including authentication/native Save/roles/recovery,
  focused Linux streaming5 and public guard85. Browser journal timestamps now use
  server time; native-file polling retries only the expected not-yet-created file.
- Scoped bridge reload deployed the adapter; persisted launcher defaults60 for
  future starts. Existing xedit PID221 and personal terminal services preserved.
  Backups retained in root-only services/before-stream-settings-20261012 variants.
  Initial graceful shutdown outlasted the short wait; existing startup helper
  recovered it, and subsequent deployments waited for exit. No unrelated restart.
- Source commit2eeb669 pushed; no release/publication. Reconnect the stream to load
  the adapter. Separate Battle-native/human media checks remain open.

## Owner-managed host reboot recovery — 2026-10-12 UTC

- Observed before starting anything: MOS uptime19 minutes; mos-desktop STOPPED,
  matching lxc.start.auto=0. Persistent Home and separate backup mounted; installed
  plugin0.2.14 and retained Python venv packages present. BridgePID7641 and both
  HTTPS nginx routes recovered automatically; nginx configuration check passes.
- Started only mos-desktop with lxc-start. Trusted preflight verifies namespace
  mapping, required Home bind, reviewed mounts, pool UUID and translated ownership.
  No runtime admission or configuration change needed. preflight.py's static
  rebootVerified:false flag is not an acceptance recorder; live evidence here
  establishes this actual reboot/manual-start result.
- All four units recovered active: agent354, files355, stream166, stream-agent356.
  Agents each retried twice while Tailscale address became available; stream
  session had zero restarts. Existing Restart=on-failure recovered automatically.
- Passed isolated layout/auth9 (stream opt-in skipped), owner auth, nested installed
  UI create/write/move/trash/restore/refresh, embedded and standalone shared-editor
  Open/Save/SaveAs/reopen/conflicts and480-key terminal/control/refresh/confirmed End,
  plus owner streaming2 native Save/ownership/view/network/refresh checks.
- Both pre-reboot nested proof files match backup SHA256. No user file restored,
  service configuration rewritten, broad mount added or unrelated workload changed.
- Manual container recovery after real host reboot is verified. Unattended
  container startup remains disabled/not claimed; PTYs/native processes do not
  survive reboot. Full rollback and actual Battle-native/human media checks remain
  separate. Audio remains disabled; no visual-quality acceptance inferred.

## Revised private single-owner Tier1 acceptance — 2026-10-12 UTC

- Explicit owner authorization supersedes earlier Landlock/JWT release gates:
  path validation, existing LXC matt permissions and practical no-loss behavior
  are the current contract. Native reparent race-proof containment and MOS-wide
  JWT revocation remain optional hardening, not current homelab blockers.
- Live identity/mount preflight: original agent1636 and files service execute as
  UID/GID1001 matt; `/home/matt` maps to Btrfs `/mos-desktop/home`. Agent namespace
  inspection found no broad host storage pool binds. Root is read-only under
  ProtectSystem=strict; Home and private temporary paths remain writable.
  LXC-generated service drop-in disables NoNewPrivileges and some kernel/control
  flags. This is disclosed, not silently changed or represented as active hardening.
- Implemented smallest existing-code change: short-lived nested mutation workers
  retain openat2 relative-path/symlink/mount checks; Landlock is optional when
  available. Atomic NOREPLACE moves and fsynced trash/restore remain. Incomplete
  receipt writes are visible without hiding other recoverable trash; no purge.
- Original installed agent lacks nested endpoints and owns user PTYs. A files-only
  instance of the same code is installed at `/opt/mos-desktop/files-backend`, with
  root-protected `/etc/mos-desktop/files-agent.json`, port18446 and enabled
  mos-desktop-files.service. Bridge trusted files_backend_origin routes nonterminal
  operations there; terminal traffic retains the original endpoint. Files agent
  rejects terminal operations. Same mTLS/owner/generation boundary, no generic
  host filesystem bridge, new identity, mount or root added.
- Persistent root-only bridge service/config backups retained with
  `.before-tier1-files` suffix. Scoped bridge restart updated routing, preserving
  original agent1636 and bash PTYs1645/1652 throughout. Container autostart is off;
  NAS reboot and unrelated workloads untouched. Frontend remains immutable0.2.14.
- MOS actual backend24 tests pass as runuser matt with one optional Landlock
  adversarial-reparent test skipped; ordinary nested operations, permission
  failures, traversal/symlink checks, conflicts, trash/restore, malformed receipts
  and forced interruption after atomic trash move pass. Development NAS initially
  passed22 tests with one optional skip before the final two tests were added.
- Installed Playwright real UI passes nested create/write/folder move/trash/restore
  and refresh, then passes again after files-service crash recovery. Backend
  SIGKILL caused automatic Restart=on-failure recovery5378->5424/NRestarts1;
  later source update restarted only files service to5480. Original PTYs unchanged.
- Existing regression: Node37; layout/auth9 with owner streaming opt-in skipped in
  default run; owner streaming2 passes actual native Save, viewer/takeover and
  disconnect/network/refresh recovery. Embedded and standalone personal-live
  checks pass shared editor conflicts/Open/Save/SaveAs/reopen and480-key terminal
  delivery/refresh/confirmed End of owned canary session only.
- Limits: one approved Home only; no invented cross-root access. Concurrent native
  reparent and optimistic Save races remain possible; no adversarial isolation
  claim. Full host reboot, separate approved backup destination and human native
  Battle/media-quality evidence stay deferred. These are not substituted by mocks
  or source inspection. Kernel/security settings and account mappings unchanged.
- Closeout: accepted source23a3b5a pushed; CI38299977850 succeeds including Linux
  services and production build/compiled-input checks. Source guard84 files and
  git diff checks pass; HEAD/origin0/0. Fixture browser suite passes separately.
  No tag/release published, immutable frontend0.2.14 unchanged. Existing internal
  DOX files remain intentionally local/untracked; no unrelated changes staged.

## Authorized nested files and scoped streaming — 2026-10-12 UTC

- Nested mutation/move/trash implementation: commits59673f5 and9511365;
  enabled-kernel GitHub run38287316813 passes actual nested, permission/boundary,
  native reparent denial and interrupted-trash receipt/restore tests. Source
  records no permanent delete/purge and no invented second authorized root.
- MOS runtime syscall444 returns ENOSYS. Development NAS also lacks Landlock.
  A real bubblewrap read-only-root/RW-Home counterexample wrote through a held
  directory handle after native reparent outside Home. That fallback is rejected.
  Nested mutations remain fail-closed/uninstalled in the active personal agent;
  no root/kernel policy was changed to manufacture acceptance.
- Selkies installation explicitly approved. Supplied2.0.0 AppImage matches
  SHA2568dcdbe239dc8930545819aae510c45283cf25922250b6b7348ff2fd790c41ed8.
  Persistent container extraction and LXC-only Xvfb/x11-apps/openbox/x11-utils
  dependencies installed. Private authenticated X display and loopback Selkies
  run as existing matt. Separate stream-agent uses existing mTLS/Home admission.
  Existing personal-agent PID and user PTYs were never restarted/ended.
- Host bridge and persistent nginx hook add scoped HTTPS stream routing with
  no access logging, no MOS cookies/bearer to iframe/backend, fixed verified
  upstreams and20-second renewable capabilities. Backups retained outside Home.
  No NAS reboot, LXC autostart change, new host permission or unrelated workload.
- Browser found/fixed generic nginx static-route precedence, truncated aiohttp
  chunk reads, opaque-frame Web Storage access and role-change closed-socket
  recovery. Each was retested through real browser/service boundaries.
- Installed immutable0.2.12 initial canary retained; final0.2.13 package SHA256
  61800940fb3b4b3ba7a1c131900d1e175f6d26c865f5ebe68ad2be366792fbad.
  Debian package/sidecars/plugin metadata retained under its version directory;
  template reconciled to0.2.13 with original backup. No release/tag publication.
- PASSED: npm test37; personal-ui fixture real browser; default installed
  Playwright9 with owner-stream check intentionally skipped. Owner stream run
 2passes including isolated login and native mouse/keyboard Save, viewer denial,
  takeover/old-controller denial, forbidden API/origin, parent-storage denial,
  disconnect/reconnect, offline/online and refresh/relaunch. xedit PID unchanged.
  Unique small native-save canaries retained, no user documents removed.
- PASSED: development Linux unittest22, with4 Landlock-only tests explicitly
  skipped; missing-kernel fail-closed path passes. Stream mTLS no-certificate
  rejection, correct viewer health and wrong-owner403 pass on installed service.
  Build, compiled boundaries, public-source allowlist and diff checks pass.
- Source streaming commit9219053 pushed; GitHub run38291439398 completed success,
  including Linux backend checks/build; publication job intentionally skipped.
- Final live file regression caught a real pointer-focus/scroll defect: mouse
  down targeted the canary file button, then redundant active-window focus
  scrolled before mouse up, retargeting click to SECTION. Backend Save succeeded.
  Active-window refocus is now a no-op. Installed0.2.14 embedded and standalone
  complete Home/shared-editor Save/reopen/conflicts and480-key terminal recovery
  pass. Candidate SHA256ea6aa359e11af0500a44961586f8b6fbaafaa51dfd465b24501822a75caee661.
  New version directory and template retained without replacing earlier bytes.
  Node37 and installed layout/auth9 pass again. Stream detach verification waits
  for its paced authenticated request rather than racing the asynchronous UI.
- Final owner-stream regression passes on0.2.14 with20ms key spacing and150ms
  after remote editing shortcuts. A zero-delay automation burst split a marker
  around native cursor movement; maximum-rate native input ordering is explicitly
  unaccepted rather than hidden. Focus-fix CI38293171023 passes. Final test/docs
  commit31431b8 is pushed; CI38293386260 completed success. HEAD/origin/main0/0.
- Final read-only service check: personal-agent MainPID1636, existing matt bash
  PTYs1645/1652 retained; new stream launcher bash4802 is separately owned.
  Stream units enabled;0.2.14 package SHA256 sidecar verifies on MOS. Private
  environment/auth/output paths remain gitignored. Unrelated untracked work stays
  untouched; source commits do not include DOX/internal records or private state.
- Remaining: MOS Landlock/equivalent containment blocks full personal-file scope
  and full STREAM1-dependent STREAM2; no authorized safe fallback remains.
  MOS logout JWT revocation needs MOS-side support. Full reboot is deferred under
  no-disruption instructions. Human media quality and real Battle-native editor
  input remain separate from MOS/browser acceptance. Audio is disabled; upstream
  AudioDecoder warnings in the opaque frame do not block verified JPEG/input and
  are not an audio claim. Optional templates/anchors/edit-lock remain deferred.

## Sustained control, installed editor and standalone closeout — 2026-10-12 UTC

- Regression first reproduced429 being converted to401 unauthenticated at the
  real HTTPS bridge seam. Installed MOS source confirms its default20/s global
  limiter. A fast sustained browser fixture also lost input control before the
  fix; the earlier short latency sample did not cover this rate condition.
- Personal views and host bridge now share80ms request-start budgets, leaving
  limiter headroom without caching identity or weakening MOS security.429 is
  rateLimited, upstream failures are503, genuine401/403 remain unauthenticated.
  Output reads back off; uncertain input is not replayed. Detach aborts input
  waiting for its request slot. Shared pacing, per-request verification and
  queued-input cancellation have repeatable regression coverage.
- Host bridge only was updated/restarted; LXC agent and user PTYs were not
  restarted/ended. Persistent source and rollback copy retained outside Home.
  Installed typing samples: first send34ms/29ms, echo318ms/397ms, approximately
  13seconds continuous input. The latter also checked all480 characters arrived.
  These are samples, not latency guarantees.
- Compiled shared Editor0.1.0 from clean SDK revision
  1140122595041dfa432731ad6a022104e5179fc0. Only minified artifact, pinned hashes,
  dependency notices and product wrapper enter this repository/package; no raw
  private SDK source or source maps. Real CodeMirror host seam and actual browser
  Open/Save/Save As/reopen/conflict retention pass. Same-name Save As refuses
  overwrite; minimize/restore preserves draft. Drafts are not persisted on close.
- Standalone entry uses existing /_plugins/ static serving at
  /_plugins/desktop/standalone/standalone.html, same-origin MOS profile gating and
  the same Plugin/backend. No new issuer, credential transfer, listener or nginx
  route. Anonymous browsers cannot mount desktop controls. Embedded host-Vue
  boundary is retained; standalone Vue is separately bundled. Origin-local layout
  and single-writer limitations remain explicit, not server-wide layout sync.
- Installed immutable0.2.11 from passing CI38211543004, verified SHA256
  960f5893879d27edaeb0af4922110c19ef6ac06ea11950abe12b81e964af85b6
  before dpkg install. Earlier candidates/template backups retained. Embedded
  and standalone live tests both pass Home/editor workflows, real cross-
  presentation stale conflicts,480-key delivery/control, same-session refresh
  and confirmed End of only owned canaries. Small unique files remain in Home.
- Final checks pass: Node37, Linux backend14 with real scratch files/PTYs/TLS and
  service lifecycle, fixture browser, compiled editor host seam, both production
  builds/hash/public-boundary checks, installed layout/authentication9. Live owner
  200/UID1001 and non-owner403 reconfirmed. Non-disruptive namespace/Home/pool/
  ownership/manual-start preflight passes. No account or unrelated workload
  changes, host reboot, personal-browser control or release/publication.
- Remaining original work is scoped blocked/deferred, not accepted: nested
  mutation/move/trash needs a containment/race policy beyond approved top-level
  Save; Selkies remains absent and separately installation-gated, blocking STREAM1
  and dependent STREAM2/media-quality acceptance. MOS JWT server revocation on
  logout is unavailable upstream; client fencing is not revocation. Full host
  reboot and Battle native-editor input evidence remain unverified. Reopen only
  the affected gate when authority/environment changes; deferred shell features
  remain excluded. All currently independent implementation is reconciled.

## Terminal typing latency correction — 2026-10-12 UTC

- Reproduced continuous-input starvation with actual browser key presses: the
  regression failed because no request was sent before typing stopped. Installed
  0.2.6 baseline first input1268ms, no visible echo during the1453ms sample.
- Fixed frontend batching:25ms deadline from first queued key, not reset by
  subsequent keys; one input request in flight, bounded queue and no uncertain
  replay retained. Successful input wakes the single-flight output reader;
  active output polls75ms for500ms, idle polls1second. Lease refresh5seconds
  instead of an extra roundtrip after every output read. Epoch guards fence late
  responses after detach/session change. Backend/authentication unchanged.
- Local browser regression passes with80ms simulated input-response delay,
  including output visible before typing ends and serialized input. Node36,
  production build, compiled boundary and70-file source guard pass.
- Commit ee3e6a1 pushed; CI38206717341 passes. SHA256
  1cc390bb0e5f9474e59744b14a59941616d05b564c9116131c281525b8adcb2e
  verified before persistent frontend0.2.7 install; previous0.2.6 retained.
  Two installed sustained-typing samples: first input28ms each, first visible
  echo174ms/172ms. Samples are not percentile/SLA claims. Created and explicitly
  ended only owned canary PTYs; no backend restart or existing-shell interruption.
  Full original ladder gaps are unchanged.

## Approved atomic existing-file Save — 2026-10-12 UTC

- User approved optimistic atomic replacement with the disclosed terminal/native
  writer race limitation. Top-level Save checks a valid SHA256 version immediately
  before rename; changed/missing targets conflict. Safe reads reject links,
  hardlinks and special files. Save As retains NOREPLACE. New inode mode0600,
  staging fsync and directory fsync remain; failures remove staging files.
- Linux backend12 passes, including authenticated HTTPS replacement/stale409,
  invalid versions, missing targets, unsafe types and staging cleanup. Node36,
  fixture-backed actual browser Save/conflict retention, build/boundary and real
  SDK CodeMirror host Open/Save/Save As/conflict/suspension pass. The latter is
  local adapter evidence, not an installed editor window.
- Updated persistent host and LXC backend sources; only scoped agent restarted,
  after confirming no user shell processes. Live owner authenticated Save200,
  stale409, Save As collision409 and preserved contents pass; non-owner403 remains.
- Source d8fe08e added saves; initial version mismatch failed CI38205040186.
  Correction6f1fe2c aligned plugin manifest; CI38205110685 passes. Verified
  artifact SHA2562eddc142d59460db3c9f34558d8a6bd4b3725f445f217aa61e65a0fbbfd1fb9a
  before installing immutable candidate0.2.6; retained0.2.5 and template backup.
  Actual installed two-view Save/reopen/stale-conflict retention, terminal input,
  refresh/End and isolated layout/auth8 pass. Small unique canaries retained.
  Public live-test/documentation commit1e26077 and CI38205631880 also pass.
- Original ladder remains partial: nested mutation/move/trash, standalone,
  installed editor and admitted streaming remain incomplete. Selkies installation
  still needs separate approval; full host reboot remains intentionally unrun.
  No account configuration, unrelated workload, release or publication changed.

## Approved persistent deployment and live acceptance — 2026-10-12 UTC

- User clarified and authorized MOS optional-package persistence. Downloaded and
  retained python3.13-venv3.13.5-2+deb13u5, pip-whl25.1.1+dfsg-1 and
  setuptools-whl78.1.1-0.1 in /boot/optional/packages; dependency checks match
  installed Python and ca-certificates. dpkg installed them now. Inspected
  mos-start confirms optional packages install before service startup;28GiB free.
- /boot cannot support venv symlinks. Host bridge/runtime/CA/private keys and
  rollback copies instead reside in root-only /mnt/user/mos-desktop/services,
  outside the LXC Home bind. Private keys stay off /boot and outside Home.
  Previously absent post-start.sh now invokes its bounded startup script. Pool
  UUID/owner/mode validated; nginx exact HTTPS route rejects HTTP, strips cookies
  and verifies bridge certificate. Configuration validated before graceful reload.
  Hook repeat execution passes; no unrelated startup script was overwritten.
- Agent runs UID1001 in LXC with filesystem isolation, limits and NoNewPrivileges;
  service enabled but container autostart unchanged/off. Live startup found
  namespace-local mount IDs and stacked bind mounts; admission now validates
  expected device/inode/mount-root/Btrfs and pins the visible fd's mount ID.
  RestrictSUIDSGID returned ENOSYS for openat2 in an isolated systemd probe;
  removed that redundant filter while retaining unprivileged execution,
  NoNewPrivileges and ProtectSystem. No unsafe openat2 fallback added.
- Live HTTPS owner health200/UID1001/files/terminal and non-owner403 pass. Real
  create/read/collision/traversal, PTY input/resize/detach/reattach, agent restart
  retaining files/refusing stale PTYs, and bridge restart recovery pass. Service
  restart canary first asserted no pre-existing PTYs. Small unique test files
  retained in Home. No unrelated workloads or accounts changed.
- Verified CI artifact SHA256 before installing frontend0.2.5 in persistent
  plugin directory; template version reconciled with original backup retained.
  Actual installed Home Save As/reopen, xterm keyboard, refresh same-session and
  confirmed End pass. Reusable tests/personal-live.cjs also passes. Isolated
  owner layout/auth browser8/8 passes on0.2.5, Node36 passes, updated Linux backend11
  passes. Source5f78b4a and e80d498 pushed; respective CI38204002065 and38204114315
  pass; no GitHub release. Private auth/deployment files confirmed ignored.
- Reboot not performed. Persistent configuration is verified, not full reboot
  behavior: a changed runtime device ID must be re-admitted before recovery.
  Full file overwrite/nested mutation/move/trash, logout JWT revocation,
  standalone presentation, live streaming and installed editor/full Save remain
  incomplete. Selkies is absent and retains separate installation approval gate.
  Prior local-only and package-warning checkpoints below are historical.

## Phase 1 local candidate and downstream gates — 2026-10-12 UTC

- Subsequent approval: user authorized scoped installation and supplied private
  MOS_MATT_USERNAME/MOS_MATT_PASSWORD. Opt-in MOS_TEST_ACCOUNT=matt uses separate
  ignored mos-matt.json state; installed browser8/8 passed with that owner login.
  Existing non-owner test configuration is preserved. LXC python3-venv installed;
  candidate backend staged at /opt/mos-desktop/backend with isolated dependencies.
  No service started, account changed, ingress reloaded or host reboot performed.
  Host python3.13-venv installation stopped at MOS's explicit discouraged-package
  confirmation; the exact waiting installer was terminated before proceeding.
  Host runtime installation needs a specific decision about this MOS safeguard.

- Implemented local0.2.5 Home/Terminal candidate, fixed MOS-profile bridge and
  non-root agent. Live read-only owner lookup confirmed matt stable ID1789030483948
  (admin), distinct from the temporary test account. Installed auth middleware and
  /auth/profile route were inspected; no stored hashes/tokens printed.
- Linux scratch /tmp/mos-personal-test.fBK8wk on code.aeyth:11/11 unittest passes
  with real openat2 file access,500 symlink swaps, NOREPLACE new-file conflicts,
  scratch restore, real PTYs, ownership/control/lease/replay/capacity, private mTLS,
  identity/generation denial, actual service subprocess stop/restart, retained
  file contents and refusal to resurrect prior PTY references. Test-only MOS
  profile fixture is explicit, not live authentication acceptance. Disposable
  virtualenv only; no existing development services changed.
- MOS read-only preflight: namespace mapping, required Home bind, only reviewed
  binds, expected Btrfs pool UUID, translated ownership and manual-start policy
  all match. No host reboot, container restart, account change or NAS service
  installation. This does not establish NAS reboot recovery.
- Node36/36, local real-browser Home Save As/conflict and xterm keyboard/detach/
  reattach/confirmed End and same-session browser refresh recovery pass. Local UI service is an explicit fixture. Installed
  isolated Playwright8/8 remains proof of installed0.2.4 layout/auth isolation,
  not installation of this0.2.5 candidate. Build and compiled-boundary pass.
- SDK stream compatibility and full packed editor React/Vue/type/lifecycle checks
  pass; real CodeMirror plus MOS host-injected Open/Save As seam passes. Actual
  MOS editor window and Battle native editor input are not accepted here.
- Safety reduction: file API creates new top-level files/folders only; no overwrite,
  nested mutation, rename or delete. Ordinary native writers cannot be given a
  false compare/replace guarantee. Full original M3 file operations remain unmet.
- Blockers: agent/bridge/mTLS/HTTPS ingress installation needs explicit approval;
  live admission and installed lifecycle depend on it. MOS logout does not revoke
  otherwise valid JWTs server-side, so full revocation remains a security gate.
  Selkies is absent in mos-desktop; installation and admitted streaming needed
  before STREAM1 acceptance or dependent STREAM2. Full editor Save depends on
  file policy; actual installed mounts depend on approved candidate deployment.
  No unsupported capability is marked accepted. Deferred shell features untouched.
- Source commits pushed:3111ee7, b967bc4,14ec814 and1b43f06. Latest GitHub run
  38200679718 completed successfully (reconfirmed after interruption); release
  skipped. It includes isolated Linux backend regressions. The stale reviewed
  public-source allowlist and workstation paths in public test documentation were
  repaired without weakening the distribution guard;69 public files pass.
- Private test-configuration check reports testCredentialsBelongToSelectedOwner=false;
  no credential value was printed. Configure dedicated MOS matt credentials in
  ignored .env.test securely before positive-owner live verification. Do not grant
  the temporary test account access to matt Home or request passwords in chat.

## Owner selection and account boundary — 2026-10-12 UTC

User explicitly selected MOS account matt. Read-only root@mos checks confirm
host matt UID1000/GID500, /home/matt and /bin/false; running mos-desktop LXC matt
UID1001/GID1001, /home/matt and /bin/bash. Persistent host directory
/mnt/user/mos-desktop/home is owned201001:201001 mode750; container /home/matt
is owned1001:1001 mode750 and is a btrfs mount. No changes made to host/container.
The local MOS knowledge snapshot's users-and-profiles and boot-and-persistence
references explain intentional non-login host users and runtime account restoration
from /boot/config/system. They are static evidence, not a new reboot test.
Use verified MOS matt identity to admit scoped LXC services; no host SSH/shell/Home
change is needed for this design. Stable principal resolution, service admission
and reboot recovery acceptance remain to be implemented/verified. User selection
supersedes the older unresolved-owner checkpoint below. Deployment needs approval.

## Original-run Phase 0 resume — 2026-10-12 UTC

Verified Node33/33, installed isolated Playwright8/8, production build and public
compiled boundary. Browser scenarios use real mouse/keyboard and include an empty
context denied profile access (401/403) and routed to Login without inheriting the
authenticated context. No credentials/session values are printed or committed.
Cross-principal ownership of future backend services is not established by this.

Comprehensive SDK codecs/snapshot/boundary/freeze/framework/core/component/Clock/
packed/editor/stream compatibility and Windows/Linux20 layout cases/17 stateful
transitions pass. Packed-editor test installation isolation was repaired. Battle
52 default/48 rollback tests,24 placement cases, remote-enabled check, IPC2,
frontend42/build pass with exact private Git layout pin fcdd0786157e6c7ad65bee05e2ea786c473e1bcb.
Supported L1–L4 acceptance is bounded: no native tab embedding, real streaming
admission, authenticated standalone service or file/PTY readiness is implied.
Native R4/P2-B2/hardware limitations remain unchanged.

Phase 1 requires explicit mapping from the verified MOS principal to the existing
ordinary matt Home owner. The temporary test login must not silently become the
owner. Original pack requires this single-owner authorization decision before
service admission. Deploying a new bridge/agent or changing ingress also requires
the separately preserved deployment approval. No service/container changes made.

## Testit config workaround and accepted control canary — 14:41 UTC

- User authorized testit network/config inspection and correction. Installed saved config matched the pasted settings, including fixed hwaddr and contradictory autostart=0/1. No evidence ties duplicate autostart to EADDRINUSE. Context7 had no exact LXC library; official lxc.container.conf manual confirms dynamic MAC allocation by default and macvlan private default.
- Isolated IPvlan-L2 trial failed with EBUSY creating a device on the macvlan-used parent; rolled back. Did not attach to Docker bridge or change host routes/firewall/network devices. Original backup /var/lib/lxc/testit/config.pre-mos-desktop-mac retained.
- Final saved config keeps macvlan and its existing parent/name/flags, removes fixed hwaddr, removes autostart=0 and retains autostart=1. Only other byte change is terminal newline. Mounts/TUN/FUSE unchanged. This is a test-container workaround using LXC-supported dynamic addresses, not a root-cause fix for fixed-MAC retention. LAN DHCP address can change; Tailscale identity remained stable.
- Passed ordinary lxc-start without override; independent normal authenticated MOS API Stop200/observed stopped/Start200/observed running. Passed installed 0.2.1 UI localhost browser3022-3/tab1 Refresh, Stop/Confirm/observed stopped, Start/Confirm/observed running and completed status. Final lxc-info RUNNING and SSH hostname testit. Browser control released; no other container targeted.
- Bounded M2 read and management canary accepted. Remaining M2 build-pack gates must be reconciled before claiming the phase complete or starting M3. No source/dependency change or publication; tests not rerun for host-only config change. Diagnosing-bugs skill drove differential config trials and prevents claiming workaround as proven root cause. Official reference: https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html

## Installed panel acceptance and repeated macvlan failure — 14:20 UTC

- User screenshot confirms installed 0.2.1 observed list including underscore name. Stale component-entry session required full page refresh; installed assets were intact. Read/list workflow accepted.
- Diagnosing-bugs loop tested saved-MAC hypothesis: testit-only config backed up to /var/lib/lxc/testit/config.pre-mos-desktop-mac, changed MAC suffix 51 to 52 using apply_patch on local ignored copy plus verified copy-back. No other semantic config change (editor added terminal newline).
- Real installed UI localhost browser 3022-3 tab1 after reload: list populated, Stop testit opened confirmation while container remained RUNNING; explicit Confirm stopped it. UI observed stopped and exposed Start; MOS lxc-info independently confirmed STOPPED. Explicit Start/Confirm failed; direct start diagnostic again showed EADDRINUSE assigning eth0 MAC. Changing saved address did not fix the repeatable lifecycle defect. Normal stop/start gate remains failed, not accepted.
- Recovered with start-time MAC suffix53; observed RUNNING and SSH hostname testit. Restored original saved config byte-for-byte SHA256 4ae1d570b456be8e296ad41089674482ed78b152aa0102ce8e0bc95454319838. Runtime override53 remains active; no shared networking edits, no unrelated process killed. Browser control released.
- Artifacts: ignored local .cache/testit-recovery/config; MOS config backup above and /tmp/mos-desktop-testit-start-2.log. Nothing published this turn. No SDK changes. Diagnosis skill prevented treating address rotation as a fix: root cause of retained macvlan state remains unproven. Further shared-network intervention requires a separately scoped decision; do not repeat address rotation or stop testit. M2 management-dependent work and M3/M4 remain gated.

## Underscore-name correction 0.2.1 — 14:11 UTC

- User screenshot showed installed 0.2.0 panel rendered but status read failed; not accepted. Live GET returned HTTP200 and 11 items, including __registry_list_test__; previous first-character validation rejected that real name. User reports MOS can assign underscore-prefixed names after spin-up problems; this origin explanation is user-reported, not independently verified.
- Corrected display-name validation to accept leading underscore; control target remains exactly testit. Added regression proving readable underscore name and unchanged control denial. Windows/Linux 26/26 tests, builds and unchanged compiled boundary passed. No container mutations in this correction.
- Published 0.2.1 source/tag 6242994a0cc446a7bfc80e7af348cf7c3e66426b. Main Actions 38146096156 and tag Actions 38146136322 passed. Anonymous Debian/source downloads byte-match independent Linux build, sidecars passed: Debian SHA256 90e245fb219905d5c6a874ecd948ff75a521d24dfb5e9a533df3ca2c6cb9a804; source SHA256 b062bd7337cf8cdb644b61c9ea231f6acdf7273610e3320d49c476f9528b28f4. No Hub metadata change required, no installation performed. Installed corrected list/Refresh remains the human verification gate; normal start conflict remains separate.

## Published M2 partial 0.2.0 — 14:03 UTC

- Source/main/tag: 1e3c6886f797f46cd6bca2b716cbbbce54149b0f. Main Actions 38145483708 and tag Actions 38145531950 passed. Release is public, not draft. Existing Hub entry still points at the correct repository/all architecture; no catalog mutation needed.
- Windows and clean code.aeyth checkout /home/matt/code/mos-desktop-release-0.2.0 passed builds, 25/25 tests and built boundary checks. Public allowlist 35 files. Runtime, component pins and notices unchanged.
- Anonymous published Debian download 162162 bytes SHA256 1a7081abe7e50b2e5551e11ff4c98014c2b4c9e6d96b0b56d81d5218cfea1e3d; source ZIP 228095 bytes SHA256 ab135c39acfd5db82f13901eea370b9ae7a702f9331eb3ae3e0cf5fbb2567bc2. Both byte-match independent build. SHA256/MD5 sidecars, architecture all and ZIP integrity passed.
- Live authenticated browser API check: localhost MOS browser 3022-1 tab 1, testit running before; stop HTTP200 and observed stopped; start HTTP500 and remained stopped. No credential values output. Browser control released; unrelated GoMCP tab untouched.
- Direct recovery also failed at the original MAC; diagnostic /tmp/mos-desktop-testit-start.log reported EADDRINUSE while assigning eth0 hardware address. A testit-only runtime override to 52:54:00:61:79:52 restored RUNNING and SSH hostname testit. Saved config unchanged; original saved MAC is 52:54:00:61:79:51. Root cause of retained/conflicting MAC remains unproven; no shared networking changes made.
- Current container is running. Normal management gate remains blocked by this observed host failure. Do not claim a successful normal round trip. Installed new-panel UI, confirmation interaction and error presentation still need verification. No plugin installation performed. Ask user to update through Hub and check status/Refresh only; avoid another stop until saved-address conflict is resolved. M3/M4 remain gated.

## Current M2 local checkpoint — 13:56 UTC

- User subsequently confirmed M1 autosave and resize persistence with MOS screenshots; bounded M1 primary workflow accepted. Historical partial statements below remain history.
- Local 0.2.0 adds container observations and explicit confirmed start/stop controls restricted to testit. MOS owns authorization and execution; no arbitrary command/target/URL, automatic retry or close-triggered stop exists.
- Verified installed MOS routes under src/routes/lxc.routes.js: POST /containers/:name/start and /stop call the MOS service; stopContainer uses lxc-stop. No changes to MOS source or configuration.
- Passed: Windows production build, built distribution boundary check with unchanged WASM hash, frontend suite 25/25, git diff --check. Automated adapter test covers fixed target/operation, request serialization and unknown outcomes without raw errors. Existing mounted panel test covers read/hide/restore/late-response cleanup; it is not a live control-UI test.
- Passed real recovery canary from MOS SSH: lxc-stop -n testit --nokill -t 20, observed STOPPED, lxc-start -n testit, observed RUNNING, SSH hostname testit after restart. Only testit was targeted; no installations or unrelated workload changes.
- Partial: browser/API control round trip and actual installed new-panel behavior not yet run. Linux rebuild, publication and plugin installation not performed for 0.2.0. Published 0.1.3 remains unchanged.
- Distribution boundary remains compiled runtime plus minimum approved interfaces/assets, with private source, credentials, source maps and fixtures excluded. No SDK or dependency changes in this slice.

Status: **M0 accepted on real MOS; M1 autosave correction 0.1.3 published, acceptance partial**. User confirms corrected startup, but reports temporary-layout mode and requests save-on-release. Immediate committed-gesture autosave and actionable persistence messages pass automated checks; updated MOS acceptance remains pending. This agent did not change the installed plugin. Later sections supersede historical partial/publication statements.

## Inputs and local results

- Original SDK ZIP SHA-256: `61a2a89a751a7fee7b7734b8077ac2bd4042ef1307871251214feb68d5a6229b`.
- SDK source: `704ae0508eb2e26314e8066c9e293b32f9c39339`; core/WASM 0.1.0. All manifested inputs verified before preparation. Current uncommitted SDK enhancements were not substituted into the frozen runtime build.
- Exact frontend tooling is in `page/package-lock.json`: Vue 3.5.43, federation 1.3.5, Vite 7.3.7, Vue plugin 6.0.3, esbuild 0.25.12.
- Windows and code.aeyth: paired runtime builds, production federation build, built asset checks and four tests pass. Tests execute real WASM commands, host-only Vue, late fetch after unmount, unavailable/malformed assets and missing-host-Vue rejection. These are supporting automated proofs, not an installed MOS route.
- Current generated wrapper SHA-256 after approved fixture pruning: `278d413f2497da7f0ea86ce7a4b00d76a95c479df2242541e4fe79f63a4af6d1` (same Windows/Linux).
- Current Linux WASM SHA-256: `77da16b7690b39141a742abab8dcc4e66769bf93fb8501aab21a63810a72121a`.
- Current Windows WASM SHA-256: `35a727287a6a33726c885a2fe89ecb5850f6c8c7a8d7cb5bf3d6f78c4c5ee869`. Both execute the canary; cross-OS byte identity is **not** claimed. Compiler is Rust 1.97.1 in both. Linux is the candidate distribution build host; build metadata/path differences are not wire-version changes. Current builds remap SDK and user-home paths; earlier hashes belong to preserved earlier builds, not current outputs.

## Historical package candidate

On code.aeyth: `/home/matt/code/mos-desktop/artifacts/review-2/desktop_0.1.0-1+mos-plugin_all.deb`.

SHA-256: `d4ad10d944f5dfc2c82a5fb2cdd2b5e5c104188d95cc09f2c1afc84330af9499`.

`dpkg-deb --info/--contents` pass: `mos-desktop-plugin`, version `0.1.0-1+mos-plugin`, architecture `all`; five frontend files under `/var/www/mos-plugins/desktop`, root-owned, directories 0755/files 0644. No native executable, backend, service, install/remove hooks or unrelated plugin content. The first local candidate had a 0700 staging root; it is preserved for review and superseded by review-2, never published. Different local candidate bytes do not imply an immutable public release was replaced.

This historical candidate is **not distributable under the current boundary**. Compiled distribution is approved, but test-only descriptor exclusion currently fails. No source archive, Actions release, Hub entry, release URL or installed-host acceptance is asserted. No source commit exists yet. `package:local` now runs the boundary gate before staging anything and refuses to create review-3.

## Work ladder gates

| Pack task | Result |
|---|---|
| M0-01 baseline/scope | PASS for bounded runtime canary: SDK/package identities recorded; published and user-installed 0.1.0 on MOS 0.6.0-stable observed |
| M0-02 paired browser runtime | Local PASS: verified ZIP, paired build, asset hashes and real reducer command tests |
| M0-03 minimal federation page | PASS: local proofs plus real MOS route and reducer PASS before/after navigation |
| M0-04 real deployment/rollback | User performed installation; page/reentry verified. Rollback procedure documented, removal not repeated; no agent NAS mutation |
| M1 and later | Not started in this verification turn; M0 runtime-loading dependency satisfied |

STREAM1 remains partial on consumer/admission/Home qualification; STREAM2 not started. This canary does not waive M3. NAPP1/local editor and NAPP2's existing partial evidence are unchanged. No SDK package version, schema or historical acceptance changed.

## Server changes and recovery

- Added build mirror `/home/matt/code/mos-desktop/` containing reviewed local source, npm dependencies, ignored private SDK ZIP/extraction, Rust target cache, generated browser assets and local review packages. It is not yet a Git checkout or published source revision.
- Added Rust **1.97.1** minimal toolchain and `wasm32-unknown-unknown` standard library through rustup under `/home/matt/.rustup/toolchains/1.97.1-x86_64-unknown-linux-gnu`; default toolchain unchanged. Preparation selects it using `RUSTUP_TOOLCHAIN=1.97.1`.
- No apt/system-package changes, service changes, container provisioning, listener, NAS modification or credential transfer. Existing Selkies/1Dev sessions untouched. Source copy used explicit files, not a broad private checkout upload.
- npm's inherited `npm_config_allow_scripts` caused an initial nested install failure; helper removes that inherited CLI option and explicitly uses `--ignore-scripts`. All later preparation/build/tests pass.
- Recovery: stop using these local artifacts; preserve caches/candidates for inspection. No installed plugin or persistent state needs rollback. Do not remove shared toolchains or unrelated source without a separate scoped decision.

## Earlier acceptance authorization

Compiled runtime WASM plus minimum bundled wrappers/generated DTOs/bindings/static assets are now explicitly approved; raw private SDK source/archive/caches, test fixtures, secrets, internal source maps and unnecessary artifacts remain excluded. Finish licensing and exclusion review locally before requesting any separate publication authorization. The user installs through Hub only after that future authorization. Verify real MOS route/reducer/error/navigation behavior before M1. Standalone authenticated access and its same-session/input-policy checks remain product requirements, not implemented canary features.

## Private homelab and temporary visibility boundary

Public repository visibility is a temporary MOS Hub distribution requirement, not a public-product goal. No community packaging, new distribution framework or permanent public build infrastructure is required. This clarification grants no commit, push, release, Hub publication, deployment or visibility-change authority.

- Installed functionality: the inspected canary fetches its bundled WASM through a module-relative local URL; it does not fetch SDK source or GitHub artifacts at runtime. Therefore repository visibility alone should not affect already-installed local canary assets. This is source-backed inference, not an observed private-repository MOS test or a guarantee for future backend features.
- Updates and reinstalls: anonymous GitHub release/source downloads may become inaccessible after privatization. Do not promise these workflows continue without verifying MOS's supported authenticated or local-source mechanism.
- Hub discovery: an existing public catalog entry may remain visible while its private release target is unavailable; cached discovery is not proof of installability. Actual behavior after a visibility change is unverified. Do not change NAS Hub configuration to test it in this run.
- Future preference: consider an existing supported private/local Hub source when needed; no new installer, registry or authentication service is authorized or introduced.

The current review-2 candidate remains **non-distributable**. The preparation helper no longer copies lifecycle fixture data or exports `FixtureEnvelope`; the product now invokes one create-workspace command using approved `Command`, `Snapshot` and `createReducer` interfaces. Old fixture files may remain in ignored caches for audit but are not imported or listed in current asset provenance.

### Earlier local verification and resolved blocker

- Passed on Windows and code.aeyth: paired preparation with original ZIP/all manifested hashes, production federation build, four mounted tests (real WASM revision 1/workspaces 1/apps 0/windows 0, late fetch disposal, unavailable/malformed WASM, missing-host-Vue rejection).
- Passed on Linux: repeated paired preparation/build hashes; license collection from locked Cargo metadata (11 third-party crates), pinned skir-client 1.0.19 MIT, federation 1.3.5 MulanPSL-2.0, Vite 7.3.7 notices and installed Rust 1.97.1 standard-library copyright/license texts. Conservatively retained 37 notice sections including build-only dependencies; this is an input inventory, not a claim that all are linked. Collected text SHA-256: `be836af26d93df01a4440b24723843e0ed07dec56f3c3b4e0e0df787c0f14b44`. No new license was invented for Battle-owned code.
- Corrected: WASM inspection exposed user-home paths from Cargo dependencies. Remapping user-home as well as SDK paths removes the detected machine paths; the full asset path/secret-pattern scan now reaches the separate DTO blocker. Pattern checks are not exhaustive secret certification.
- Failed, intentionally fail-closed on both hosts: `check:built` rejects `FixtureEnvelope` in compiled JavaScript. The pinned SDK's `generated/typescript/skirout/runtime_protocol.js` registers this test-only DTO in its shared descriptor table. Ordinary bundling retains that registration despite no fixture import/export. No fixture JSON data remains in the current application, but an unnecessary test-only binding does.
- Blocked: new Linux `.deb` creation; the packaging helper calls the same gate before staging and includes only allowlisted frontend files plus notices/provenance when it eventually passes. No review-3 `.deb` exists. Preservation of historical packages confirmed.
- Next required decision: authorize a narrowly reviewed SDK build-output change separating/pruning the test-only descriptor, or supply an existing approved fixture-free compiled interface. Changing frozen schemas, hand-editing generated codecs or waiving the minimum-content boundary is not performed in this run. No further independent M0 implementation remains within the unchanged SDK boundary.
- Public-source rebuild strategy and actual MOS loading remain unverified and are not publication/deployment authority. Installed operation uses local assets; build preparation still requires the authorized private ZIP.

Server delta for that follow-up: updated only the existing `/home/matt/code/mos-desktop` source mirror, ignored generated assets/notices and build caches. No additional toolchain, system package, service, listener or NAS change. The blocker described above is superseded by the approved correction below; historical candidate hashes remain historical.

## Approved build-only correction — current acceptance

The user approved narrowly excluding FixtureEnvelope without runtime behavior changes. `scripts/prune-fixture.mjs` is an in-memory bundler transform applied only after archive/all manifest checks. It removes exactly the test-only declaration/initializer block and final descriptor registration from the pinned generated protocol input, preserves all other source slices verbatim, and rejects unfamiliar layouts or remaining fixture references. No SDK file, schema, frozen serializer, private release, version or WASM implementation is edited. Provenance records `exclude-test-only-FixtureEnvelope-v1`. This consumer-side SDK build-output correction avoids republishing or modifying the historical SDK archive.

- Passed on Windows/Linux: paired preparation, production build, all five tests, allowlisted output/manifest/hash checks, no fixture/source-map/private-path/secret-pattern matches, host-Vue-only proof.
- Added behavioral equivalence proof: every command in the original private lifecycle fixture is run through both original and pruned bindings with real paired WASM, comparing full serialized results and subsequent snapshots. Fixture data and original bindings are test inputs only, never public package files. Changed-layout negative test passes.
- Linux WASM remains `77da16b7690b39141a742abab8dcc4e66769bf93fb8501aab21a63810a72121a`; Windows WASM remains `35a727287a6a33726c885a2fe89ecb5850f6c8c7a8d7cb5bf3d6f78c4c5ee869`. Thus this DTO-output pruning changes neither paired WASM binary. Wrapper identity is updated above; no published artifact was replaced.
- Selected candidate: `/home/matt/code/mos-desktop/artifacts/review-4/desktop_0.1.0-1+mos-plugin_all.deb`, SHA-256 `e7fba0e247772da0aabfcbeed218b36732118e49d56fb7f029d8a8132d918190`. Independently staged review-5 compares byte-identical. Review-3 is preserved as an earlier non-normalized local candidate, not published.
- `dpkg-deb --info/--contents` pass: version 0.1.0-1+mos-plugin, architecture all, root-owned directories 0755/files 0644; five frontend files plus notices and provenance under `/usr/share/doc/mos-desktop-plugin`. No hooks, service, native executable, private source, fixtures, caches or source maps. Timestamps and `SOURCE_DATE_EPOCH` are fixed at zero; this is repeated packaging from the same pinned prepared inputs, not a claim of independent clean-machine byte reproduction.
- Server changes only update the existing build mirror/cache and add review-3/review-4/review-5 local candidates. No installations, service/listener changes or NAS operations. Old candidates remain intact.
- Local M0 distribution blocker is resolved. M0 remains partial solely on actual MOS loading and separately authorized delivery. No commit, push, publication, installation or M1 work occurred. Public-source regeneration from compiled inputs is a future delivery concern, not implemented public CI.

## MOS Hub release — current delivery evidence

- User approved scoped publishing through the supplied MOS Hub quickstart; installation is left to the user. Public repository `https://github.com/mfleming1290/mos-desktop`, main/source/numeric tag `0.1.0`: `d2a9c84637a17bbb65e6af257722b35bd292482a`.
- Main Actions run `38127391212` and tag build/release `38127445830` passed. Release: https://github.com/mfleming1290/mos-desktop/releases/tag/0.1.0 . No existing tag/release was overwritten.
- Public source is 20 explicitly reviewed files: application/config/lock/tests, minimum build/release helpers, pinned Actions workflow and four approved compiled-interface/provenance/notice files under `runtime/`. Raw private SDK, preparation/pruning helpers, original private-input tests, AGENTS/DOX/this internal evidence, caches and source maps were not committed. Preserve those local files; they remain untracked intentionally.
- Public source builds from the hash-verified compiled runtime interface, not private SDK regeneration. Frozen source revision remains `704ae0508eb2e26314e8066c9e293b32f9c39339`; source commit and compiled provenance are distinct. No SDK version/source/release changed.
- Actions workflow adapts existing Binary Manager/Clock conventions: main/PR validate only, numeric tag releases, least-privilege workflow token, SHA-pinned actions, draft upload then publish. No private credentials, private dependency fetch or additional registry. No community platform added.
- Fresh public GitHub clone `/home/matt/code/mos-desktop-public-release-0.1.0`, separate `.isolated-npm-cache`, no SDK extraction/node_modules/Cargo targets: npm ci, compiled staging, production build, four public real-WASM/host-Vue/error/disposal tests, package checks and source archive all pass. Package and source ZIP reproduce Actions downloads byte-for-byte. Earlier five-test private-fixture equivalence remains supporting proof; it is not run in public CI.
- Published `desktop_0.1.0-1+mos-plugin_all.deb` (141732 bytes), SHA-256 `e7fba0e247772da0aabfcbeed218b36732118e49d56fb7f029d8a8132d918190`, MD5 `b89b7d60c2804c7a2162eb5a5a3d438f`. Corresponding `.deb.md5` and `.deb.sha256` sidecars resolve and verify actual downloaded bytes.
- Published `mos-desktop-0.1.0-source.zip` (199261 bytes), SHA-256 `b66be13a88a0718a79116c3e106b1c693777edc7c485ecf7472ef2fc86d76f7c`. ZIP integrity passes; 22 members comprise the 20 reviewed source/compiled-input files plus two MOS checksum files under the normal `mos-desktop/` root. Below 10 MiB. No unrelated sources or caches.
- Anonymous curl downloads from all four release URLs pass; downloaded Debian and ZIP compare byte-identical to fresh public build. URL-encoded `+` initially retained `%2B` in local curl filenames; corrected explicit output names, with no release change. Debian metadata/inventory/no hooks/services and original runtime hashes pass.
- Hub catalog commit `fc4b06b3ee414f618d3026f5710fce2d01c077e0`: only `plugins/desktop.json`, `images/desktopIcon.svg` and two MANIFEST additions. Catalog advertises `all` (frontend/WASM only), settings/page action true, no widget/backend/driver. Existing entries/maintainer unchanged. JSON/manifest uniqueness/targets/whitespace checks and anonymous raw catalog/icon/manifest URLs pass. Running MOS cache/discovery has not been inspected or refreshed by this agent.
- Server additions limited to the fresh public clone, isolated npm dependency cache, generated build/source/package outputs and `downloaded-release/` verification files. No OS/toolchain installs, listener, services, running applications or NAS changes.
- Next: user refreshes the normal Hub, installs MOS Desktop 0.1.0, opens its page and confirms `Runtime PASS — revision 1; workspaces 1; apps 0; windows 0`, then navigates away/back without errors. Missing/corrupt WASM and disposal are automated supporting proofs, not destructive live tests to repeat. M0 remains partial until real loading is observed; do not start M1.

## Real MOS M0 acceptance — 2026-10-11 UTC

- Human observation: user reports successful installation/opening and supplied screenshot showing MOS Desktop M0, expected reducer PASS and MOS 0.6.0-stable. This is functional rendering evidence, not proof of internal cleanup.
- Direct browser observation through the explicitly requested terminal-browser-testing skill: terminal-browser v0.13.4 in existing WSL Ubuntu-24.04, browser `1572-1`, tab `1`, origin/route `http://localhost/plugins/desktop`, title `Plugin - MOS`. Windows PATH lacked the CLI; existing WSL executable discovered without installation. `ls --all` selected the user's existing session; no additional browser was launched.
- Initial DOM snapshot contains `Runtime PASS — revision 1; workspaces 1; apps 0; windows 0` inside the MOS Desktop runtime canary region.
- Clicked the page's Back to Plugins link using its fresh DOM reference. Plugins DOM lists MOS Desktop v0.1.0, along with existing Clock/Binary Manager and unrelated plugins. Clicked only MOS Desktop's Open button; final DOM again contains exactly the expected Runtime PASS. The browser errors action returned no captured errors. No settings, install/removal/update controls or infrastructure controls were invoked.
- Released control using `done`; returned state confirms agentControlled false, page still open and not loading. User-owned browser/tab was not closed.
- Combined acceptance: actual MOS federation/WASM reducer loading and route reentry now pass, supported by unchanged release integrity, independent build, host-Vue boundary and automated abort/late-result/error/equivalence proofs. No repeated builds required for this observation-only turn.
- Limits: no live memory/timer instrumentation, new installed-file hash audit, cache refresh, uninstall/reinstall, reboot, or standalone authentication/session acceptance claimed. Cleanup internals remain supported by prior automated tests, not inferred from snapshots. Existing rollback uses normal MOS removal; not executed again.
- Result: M0 runtime-canary gate accepted; M1 dependency cleared. No desktop shell, backend, streaming admission or later product capability accepted or implemented by this result. No NAS mutation, commit, push or release performed in this verification turn.

## Local M1 implementation — 2026-10-11 UTC

User approved continuing M1, not new publication/installation or M2. Main remains at `d2a9c84637a17bbb65e6af257722b35bd292482a`; work is uncommitted. The supplied 0.1.2 build-pack task catalog, runtime contract, Vue shell, lifecycle/layout, app contracts, decisions and acceptance matrix guided this implementation. Selected policies: one workspace; static Clock/About catalog; About single-instance; minimize restores to normal; local Clock activity follows visible/nonminimized/page-visible state; view closure has no backend authority.

| Task | Verified local subset / remaining gate |
|---|---|
| M1-01 controller | Passed real WASM serialized commands, stale rejection retaining snapshot, disposal fence and fatal runtime blocking |
| M1-02 app catalog | Two unique Clock apps/views and harmless About; single-instance reveal; close-last-view leaves siblings intact; package interfaces used |
| M1-03 frames | Implemented snapshot-derived bounds/order/visibility, capability controls and separate reserved taskbar area; built mounted proof passes; actual MOS geometry pending |
| M1-04 focus/keyboard | Model-directed intentional focus, descendant preservation, keyboard title/resize controls and Alt+Shift window controls; hidden/inert minimize proof; actual MOS/browser input pending |
| M1-05 gestures | Pointer capture, local preview, one final bounds command, Escape/cancel/lost-capture/resize/route cancellation paths; synthetic mounted move/commit/cancel and stable sibling sessions pass; real pointer escape/capture pending |
| M1-06 presentation | Maximize projects work area without rewriting normal bounds; explicit normal restore, minimum sizing/offscreen title recovery; mounted maximize/minimize/restore and geometry proofs pass |
| M1-07 launcher/taskbar | Derived from static definitions/current workspace order; launch/focus/restore use the same controller; no second window registry or shell-contribution implementation |
| M1-08 lifecycle | Stable window keys and host/config objects; independent config, no movement/maximize-driven Clock remount; minimize clears one timer, restore reacquires one, close/route exit clear owned timers; late asset delivery ignored |
| M1-09 persistence | Local supporting checks pass: bounded v1 intentions, server-profile scope adapter, Web Locks single writer, failed-read preservation, account-change pending-write fence, unknown apps/config recovery, deterministic restore/focus-last and route flush. Actual MOS authentication/layout integration remains pending |
| M1-10 actual MOS workflow | Blocked on separately approved M1 delivery and human/real-browser workflow; installed M0 is deliberately untouched |

### Commands and environments actually checked

- Windows Node **24.19.0**: `node scripts/prepare-components.mjs`; `npm ci --ignore-scripts --no-audit --no-fund` in isolated source-only staging; runtime staging; production federation build; test suite; built boundary checks. Final working-tree suite: **13/13 pass**. Initial mounted tests exposed an intermediate-workspace rendering guard and a JSDOM nonvisual default; these were corrected and rerun. Generated enum projection uses actual uppercase kinds, not schema spelling guesses.
- Linux code.aeyth Node **24.21.0**: new source-only `/home/matt/code/mos-desktop-m1-review-20261011/`, fresh dependency acquisition/npm ci, compiled staging, production build, **13/13 tests**, built boundary/integrity checks. No private SDK source required. Existing development mirrors, services and applications were untouched.
- `npm ls vue --all`: one deduplicated Vue **3.5.43**. Built federation has no bundled fallback Vue or React projection, fixtures, source maps, detected machine paths or credential patterns. Tests prove loading fails without host Vue. Pattern scans are not exhaustive secret certification.
- Runtime and manifest metadata: unchanged tracked `runtime/` and `page/plugin.config.js`. Clock/contracts lockfile SHA-512 integrity is checked against actual archive bytes, in addition to the SHA-256 identities below.
- Windows fresh source-only staging `.cache/m1-clean-20261011/` passed the earlier 12-test suite/build; final 13-test source was separately rebuilt/tested on Windows and Linux. Final six asset bytes match across those two hosts. Do not claim a Git checkout/Actions run for these uncommitted M1 sources.
- `scripts/check-release.mjs` and `scripts/package-local.mjs`: intentionally reject with the M1 immutable-0.1.0 guard before packaging/publication. No M1 Debian/source release artifacts were generated. The existing public source allowlist still needs explicit delivery reconciliation; internal contracts/evidence and caches remain excluded.
- Existing local/private `node --test tests/runtime-canary.test.mjs`: **5/5 pass** after adapting its mounted expectation to M1. The original private fixture still runs unchanged through baseline and fixture-pruned bindings, comparing complete serialized lifecycle command results. This supporting private-source proof remains excluded from public packaging.

### Exact unchanged component identity

- Component source revision: `833075ac26cd8d5ebc67d131d3a77fa3a7a17c7e`.
- Clock 0.1.1 tarball SHA-256: `fc21c9289ab21af48277b002f1c1dd5965f1dff6fd750eb28f573aa9966fe889`.
- Contracts 0.1.1 tarball SHA-256: `f258196f0a2571db195c32057ef2a60f487a9d247a2eb3f8960869d81d5b8a7d`.
- Download source: existing public Clock plugin `a06361b0d40f26bf3a66da1ebe24ea2264efbb23`, `vendor/` archives; anonymous pinned downloads pass. Cached under `.cache/components/`, never included as plugin/source output. No new registry, private dependency access or copied Clock domain implementation.
- Frozen SDK source, compiled wrapper and WASM identities remain those recorded above; no SDK source/version/contracts change.

### Earlier local build SHA-256 (Windows and Linux equal before profile adapter)

| File | SHA-256 |
|---|---|
| manifest.json | `a75425e99d4fc0ebfd230fa6f0ff4c260ad885e713f54d48aa8f25b325e554e4` |
| remoteEntry.js | `b9b5a7f8ef610927a2562bf0158f89fcebb1519eda186387dd0929e511170340` |
| runtime-9X-jNx9O.wasm | `77da16b7690b39141a742abab8dcc4e66769bf93fb8501aab21a63810a72121a` |
| __federation_expose_Plugin-BnPx0p2u.js | `273fd971a2ce2a29d7787f00b6c81a6430860dfdb4e302c5b4fc8c1c74325088` |
| __federation_expose_Plugin-D06mtkQj.css | `d81f9ebd6d680074ea0e42200bdedf5c691470d46b51834d4ef0021676e23265` |
| __federation_fn_import-Bomqxh9m.js | `0622c0bc9d1cc8ebf328fd0fff779049d2fdb3f01eadff3bc030e8f36651d64f` |

### Browser/profile limits and next frontier

- Terminal-browser v0.13.4, browser `1572-1`: isolated local preview copies under `.cache/m1-preview/` were served briefly on loopback 18034, first Windows then WSL. WSL HTTP responded 200, but the existing browser returned `chrome-error://chromewebdata/`, not a rendered M1 page. User subsequently clarified the browser uses `terminal-browser open --ssh root@mos localhost:80`; its requests are proxied through MOS, explaining why Windows/WSL loopback was the wrong target. No visual M1 smoke pass is claimed. Only agent-created test tabs were closed; original MOS tab 1 remains open and control was released with `done`. Both temporary servers were stopped. The cached preview is an earlier local build, not the final artifact above. Future MOS checks must preserve the SSH-backed route rather than assume local-browser networking.
- Knowledge-pack index routes to source-backed users/profiles and plugin references. Those identify `/api/v1/auth/profile` but do not establish a verified plugin identity binding for the installed version. Read-only same-origin cookie-authenticated GET from existing MOS tab returned **401**. No token extraction, alternate-credential workaround, API mutation or service change was attempted. Host-authenticated scope wiring remains a separate unresolved integration step, not guessed from a name or shared localStorage key.
- Required next: establish the existing trusted MOS authentication/profile seam (read-only), then separately approve delivery with a new immutable release identity/public-source review. User can install through Hub and exercise two Clocks/About, pointer/keyboard controls, viewport recovery, route/reload, scoped settings/layout restore and update. Neither screenshots nor automated timers alone substitute for the other evidence class.
- No M2/backend/LXC/Docker/standalone-auth work started. No NAS installation/update/removal/restart. No commit/push/release/Hub changes. Rollback remains the unchanged published M0 release; preserve local M1 source and original runtime/caches. Default M1 stores no persistent user layout until verified scope/locking are available.

## M1 continuation — MOS profile binding, 2026-10-11 UTC

- Implemented the narrow existing MOS authentication seam, not a new broker: same-origin GET `/api/v1/auth/profile` with the existing `authToken`, no redirects, no JWT decoding, no browser-stored userid inference, no credential output or storage. Only a bounded server-returned string id becomes `mos:user:<id>`. Denied, invalid, cancelled or stale responses produce memory-only behavior. No live credentials were read in this verification run.
- Source references inspected: [MOS frontend useApi](https://github.com/mos-nas/mos-frontend/blob/1e8dd921fdeb2001b75f93933bd87baeaffe4802/src/composables/useApi.ts) and [MOS profile route](https://github.com/mos-nas/mos-api/blob/8e4c1537ee32473273a512b86b8c041ac4984e5f/src/routes/auth.routes.js). These upstream revisions establish the normal API contract, not proof of the installed server's revision. Existing Clock plugin settings helper independently uses the same authToken request pattern.
- MOS entry bounds profile acquisition to ten seconds, aborts it on route exit, and suppresses stale completions. Account storage events and foreground identity checks reverify/remount. Each layout read/save/flush checks the credential still matches the verified profile; same-tab changes also fence writes immediately, without awaiting a storage event. No periodic polling or additional dependencies.
- Reproduced and fixed a storage regression: a denied read previously looked like an absent record and could enable later overwrite. Failed reads now disable recovery writes and preserve the record. This is a necessary bounded correction within M1.
- Windows production build and built artifact boundary/integrity checks pass. Public/local suite **17/17 passed**, including the built federated entry with simulated authenticated profiles/account switching and pending-write suppression; private frozen compatibility/lifecycle suite **5/5 passed**. Async profile startup required waiting for the actual asset request in both late-delivery tests; their abort/no-resurrection assertions remain unchanged. Current profile-adapter changes were not rerun on Linux, in Actions, or installed MOS. Earlier Linux equality evidence applies only to the preceding build.
- Current Windows build SHA-256: manifest `a75425e99d4fc0ebfd230fa6f0ff4c260ad885e713f54d48aa8f25b325e554e4`; remote entry `efa1b020f394540e459932fd0504c88fe41f8b035ddf5992cdc05749cb877935`; Plugin JS `482867b7c25b962348a093d78d9c996de0e62bf62fa2ae18dedf4644bd8293c7`; CSS `21b2f9b6be3425f5baebaf3ae09a242880755906f117dfc3aef76e7ae7f5c03b`; federation import `0622c0bc9d1cc8ebf328fd0fff779049d2fdb3f01eadff3bc030e8f36651d64f`. WASM remains `77da16b7690b39141a742abab8dcc4e66769bf93fb8501aab21a63810a72121a`; Clock/contracts identities above are unchanged.
- Remaining frontier: separately approve M1 delivery with a new immutable release identity and public source/notice review, then user-controlled Hub update and actual MOS pointer/focus/layout/account/reload acceptance. No M2, commit, push, publication, package generation, server modification or installation occurred. Installed M0 and rollback inputs are unchanged.

## M1 publication — 2026-10-11 UTC

- User approved this and future MOS Hub publications for this project. This includes necessary scoped source commits/pushes, numeric releases and catalog changes after verification, but does not grant NAS installation/live changes or later feature scope. M1 remains partial until actual MOS update and observation; do not start M2.
- Public source/tag `0.1.1`: `832e3caa8fd9441dfd525125f4c06215b27c39c1`. [Main build](https://github.com/mfleming1290/mos-desktop/actions/runs/38130927584) and [tag build/release](https://github.com/mfleming1290/mos-desktop/actions/runs/38130977272) passed. [Release](https://github.com/mfleming1290/mos-desktop/releases/tag/0.1.1) is public/non-draft/non-prerelease. No published 0.1.0 bytes or tags replaced.
- Clean public checkout `/home/matt/code/mos-desktop-release-0.1.1` on code.aeyth acquired exact public Clock/contracts archives without private SDK access, installed locked dependencies, staged unchanged compiled inputs, built, passed all 17 tests/boundary checks and packaged from 32 allowlisted source files. Package and source archive exactly match anonymous downloads of Actions release assets. No OS packages, services or NAS files changed; only this code-host checkout and its ignored build/dependency/artifact caches were added.
- Distribution review: approved compiled runtime/wrappers remain unchanged; shared Clock/contracts are consumed through their package interfaces and retain exact hashes above. The bundled third-party Skir client remains 1.0.19/MIT; existing retained notices already cover it, the federation MulanPSL-2.0 helper, Vite notices and compiled Rust dependencies. No new third-party runtime implementation was introduced. Private SDK source, internal AGENTS/evidence/DOX, caches, test fixtures, credentials and source maps are excluded by the exact public-source and built-asset checks. Public tests are plugin tests, not private SDK fixtures. No additional Vue runtime is bundled.
- Debian `desktop_0.1.1-1+mos-plugin_all.deb`: 159936 bytes, architecture **all**, SHA-256 `74363a37104088414e49c681c79227b63c88563f9305f065f93bccc154821581`, MD5 `2dc9ca6f9f2062621b7dea4bfc0457a4`. Control contains only metadata, no maintainer scripts. Contents are six web assets plus notices/runtime provenance with root ownership and normalized permissions/timestamps. MD5/SHA-256 sidecars resolve and match downloaded bytes.
- Source `mos-desktop-0.1.1-source.zip`: 220270 bytes, SHA-256 `24e22595735ddee4be9a5e194cf841a4c8ca1c3e1a63aec10d1ba42a38a42c03`, valid archive, 32 root source files under the established mos-desktop archive prefix plus two checksum files. Well below 10 MiB; no private files/caches. Only this version's checksum files enter the archive.
- Hub `bd3fb1729c0787fef2e56fd80f764d693865593a` changes only `plugins/desktop.json` description and its existing MANIFEST description. No version field invented, architecture stays all, icon unchanged, all other entries preserved. Anonymous current catalog/icon/manifest URLs resolve and match M1 metadata. JSON, manifest target/uniqueness and whitespace checks pass. Initial manifest checker incorrectly treated descriptive columns as part of filenames; corrected parsing passes without changing unrelated entries.
- Exact next step: refresh Hub, use **Update** on MOS Desktop to 0.1.1, then reload its page. Verify two independent Clock windows/About; move/resize/focus/minimize/maximize/close and taskbar restore; refresh for layout/config recovery when the profile and Web Locks are available; navigate away/back. Use a localhost/HTTPS secure context for Web Locks, or expect explicit memory-only fallback. No agent live installation, update, settings write, cache refresh, removal or restart was performed. Actual MOS M1 behavior, account isolation and internal live teardown are not inferred from release success.

## M1 corrections and 0.1.2 delivery — 2026-10-11 UTC

- User screenshots/reports establish installed Clock/About rendering and ticking, with partially working refresh recovery. HTTP LAN IP/hostnames failed with randomUUID unavailable; localhost/HTTPS worked. Screenshots do not establish internal disposal or complete M1 acceptance.
- Reproduced both defects in the actual built federation mount before edits: HTTP-style crypto startup failed and a saved x=1550 corner restored as x=680 against fallback dimensions. New tests were initially red (17 pass/2 fail). Corrections use cryptographic getRandomValues UUID-v4 generation when randomUUID is unavailable, and measure positive workspace dimensions before clamping restored bounds. No weak randomness, new dependency, runtime authority or SDK change.
- Save layout now serializes and flushes through the existing queue and displays an increasing successful-save count. An intermediate test exposed redundant automatic saving overwriting confirmation; fixed before delivery. Windows and fresh public Linux build each pass **19/19** tests and built-boundary checks; private frozen compatibility/lifecycle tests pass **5/5** on Windows.
- Source/main/tag 0.1.2: `0ff2c57450ec9670554dbecea5dceb07d1d8c71e`. [Main Actions](https://github.com/mfleming1290/mos-desktop/actions/runs/38134551148) and [tag Actions](https://github.com/mfleming1290/mos-desktop/actions/runs/38134660823) pass. [Release 0.1.2](https://github.com/mfleming1290/mos-desktop/releases/tag/0.1.2) is public, non-draft, non-prerelease. Earlier releases/tags remain intact.
- Clean code.aeyth checkout `/home/matt/code/mos-desktop-release-0.1.2` independently builds/packages from pinned public inputs; anonymous release downloads match its SHA-256 values. Debian is 160222 bytes, architecture all, SHA-256 `846e7e2ba84028fc95f55cdfad5d74edcdeb2f7e47e338dfa4b72ab2d831a92b`, MD5 `8db3e9f53beb74d9a9e41a8f62d3448a`; both checksum sidecars match. Source ZIP is 221612 bytes, SHA-256 `73f7d430a4ccc9c159cc5477da6f7db6e0940705177bffe02d7da1fe49983346`; archive integrity passes. Public allowlist remains 32 files; Debian control has metadata only, six web assets plus notices/provenance, no hooks/services/private source/maps. Applicable notices and exact SDK/Clock/contracts hashes above remain unchanged.
- Existing anonymous Hub catalog resolves to the same repository, architecture all and correct metadata; no catalog edit/version field is needed for release discovery. No Hub or NAS mutation. Only the clean coding-host checkout and ignored dependencies/build/package caches were added; no OS installs, listener or service changes.
- Limits/next: user updates through Hub to 0.1.2 and checks LAN HTTP startup, then same-origin HTTPS/localhost corner positioning, Save layout confirmation and reload. HTTP still lacks Web Locks and intentionally uses memory-only layouts. Layouts are origin-local; changing addresses is not a shared-session restore test. Standalone authentication/backend/streaming remain later scope. M1 remains partial until corrected real MOS workflow is observed; no M2 started.

## Save-on-release and persistence diagnostics — 2026-10-11 UTC

- Request: automatic saving when a window is released, without a routine Save button; permission granted for needed fixes. Existing implementation already debounced layout changes, but temporary-mode messaging combined different requirements and made the unavailable capability unclear. Missing locking is not repaired by removing account/single-writer protections.
- Direct read-only browser check using terminal-browser-testing: WSL terminal-browser 0.13.4, existing browser `3022-1`, tab 1, `http://localhost/plugins/desktop`. Secure context true, Web Locks object present, MOS credential presence true; same-origin authenticated profile GET returned 200 with string id. Only capability flags/response property types were output, never credential/profile values. Existing page showed the older save wording, so this is supporting integration evidence, not installed 0.1.3 proof. Control released with done; no navigation, reload, install, settings or layout writes. The user's screenshot's missing requirement remains unidentified for that separate origin; new messages distinguish it.
- Regression loop before implementation: missing-requirement test and built-shell no-routine-save-button test fail against 0.1.2 (11 pass/2 fail in focused invocation). After changes, **21/21** Windows and clean Linux public tests pass. Built mount proves corner restoration, persisted committed move and resize within the existing 100ms test settle (rather than the old 200ms debounce), no persisted preview/cancel bounds, failure-only retry button and successful recovery. Existing profile/account-change, denied reads, single-writer, disposal and lifecycle tests remain green; private frozen runtime compatibility suite **5/5** passes on Windows.
- Changes remain in existing frontend modules: pointer release dispatches bounds through the serialized action queue, recovers geometry, queues the scoped record and immediately flushes. Other changes retain debounce. Save confirmation count remains; Retry autosave is visible only after a failed write. Missing profile, storage or Web Locks has its own actionable temporary-layout message. No fake lock, weaker identity, second persistence engine or new dependency.
- Public source/main/tag `0.1.3`: `9a08b73e1a3a601940f1158e511c70d5b09abfdd`. [Main Actions](https://github.com/mfleming1290/mos-desktop/actions/runs/38136714912) and [tag Actions](https://github.com/mfleming1290/mos-desktop/actions/runs/38136765128) pass. [Release](https://github.com/mfleming1290/mos-desktop/releases/tag/0.1.3) public/non-draft/non-prerelease; release notes describe this patch. Existing Hub catalog/icon resolve correctly and require no edit.
- Fresh code.aeyth public clone `/home/matt/code/mos-desktop-release-0.1.3` passes pinned component acquisition, locked dependency install, compiled staging, production build, 21 tests, built boundary, packaging, 32-file source allowlist and ZIP integrity. Debian architecture all, metadata-only control, 160314 bytes, SHA-256 `fd3ef28282aeb54e77f9e49a221df952bf8f7275e7841ed1c989bfea01e804fe`, MD5 `e0fdb9dfaaa2cbd8bd074c9dacc2ce69`. Source ZIP 222610 bytes, SHA-256 `fa4728b5c6a2f997f1b72899ea23790a30ef612f745d1a6c29ce01a84f1dfde8`. All four anonymous release downloads/sidecars match the independent build. Approved runtime/Clock/contracts inputs, notices and public distribution boundary unchanged.
- Server delta: only that coding-host checkout and ignored dependencies/build/package caches; no OS installs, services, listeners or NAS changes. Previous release/rollback artifacts preserved. Main/origin main synchronized; internal records/private helpers stay local/untracked.
- Next/limits: user-controlled Hub update to 0.1.3, then same-origin HTTPS/localhost move/release/refresh. No routine Save button is required. Plain HTTP LAN still intentionally memory-only when Web Locks is missing. If profile/storage is missing even on HTTPS, the specific message identifies that separate issue. No installed 0.1.3 or live cross-account/internal teardown acceptance claimed; M1 remains partial, M2 not started.
# M2 safety reconciliation and M3 admission gate

- Added control tests for HTTP 401/403 denial, HTTP 500 uncertainty, credential replacement, missing credentials, and the actual 45-second abort deadline using virtual timers. Each proves no automatic duplicate request; timeout exceptions remain redacted.
- `node --test tests/desktop-mos.test.mjs`: passed 6/6. `cd page; npm test`: passed 28/28, including built-module behavior and single-writer/profile persistence checks. Existing installed UI confirmation and Stop/Start evidence remains the behavioral management canary.
- M2-01/02/03/05/06 bounded acceptance is satisfied by the fixed adapter, observed status, confirmed testit control canary, origin-local single-writer persistence (no NAS settings writes), and failure checks. Optional M2-04 Binary Manager integration is deferred; no second supervisor is needed.
- Read the M3 boundaries/provisioning guide. Read-only MOS inventory confirms /mnt/user is mounted Btrfs UUID 1cce377d-70dd-4f04-b345-4765382eb5c1, with 423 GiB available. Subordinate UID and GID files each list root:100000:65536; these alone do not prove an unused mapping allocation. testit is RUNNING.
- M3 remains unprovisioned. Existing testit is privileged and broadly binds /mnt/user; neither is acceptable unchanged. Proposed next contract: repurpose only disposable testit, verify an unprivileged mapping, remove the broad pool bind and unnecessary devices, use one ordinary desktop user, and bind only a dedicated new /mnt/user/mos-desktop/home directory. No existing pool-wide ownership changes, no shares, no host management credentials, no public listener before scoped authentication. Mapping allocation and image pin must be checked before mutation. User approval of this concrete storage/isolation choice is pending.
- No commit, push, release, plugin installation, or additional host mutation in this reconciliation. Test-only changes do not require a new plugin binary.

# Approved permanent-backend migration and 0.2.2 publication

- User explicitly approved the Home/isolation proposal, requested retaining existing matt and renaming testit to mos-desktop for eventual permanent use. Only this container was stopped/renamed/reconfigured. Other containers, host networking, firewall, MOS service source, subordinate-ID files and SSH trust/config were not changed.
- Context7 had no exact LXC library (only Incus and related projects); used official LXC copy/config manuals plus installed help. lxc-copy -n testit -N mos-desktop -R succeeded while stopped. Tailscale automatically adopted the new hostname, keeping 100.95.222.23; old local testit.aeyth alias now resolves the obsolete name. DNS mos-desktop resolves correctly. SSH to the new hostname stopped at host-key verification; trust was not bypassed. MOS lxc-attach remains available.
- Preserved original rootfs/config privately in /mnt/user/mos-desktop/recovery. Rootfs tar SHA256 5340abf85f0c5704bc53a2ce2c3fc96efb73dbe814a321d47a952aff0f3c02d5. This is same-pool recovery, not independent disaster backup, and contains private user data. Recovery directory 0700, archive 0600; excluded from Git/public artifacts. Existing installed Ubuntu 24.04.5 was preserved, not replaced with an unverified new image. Full rebuild/image provenance remains later M3 work.
- MOS binds the rootfs as a mountpoint, so attempted move failed EBUSY before any ownership change. Revised migration preflighted all owners, rejected unexpected mount boundaries and ACLs, then shifted and verified 33,534 unique objects by +200000 while stopped, restoring mode bits. No pool-wide chown. Restored the sole observed file capability (ping) with namespace rootid 200000. Runtime init UID/GID maps both prove 0 -> 200000 for 65536 IDs, distinct from existing lxc-registry 100000 range. Root-host namespace test succeeded without changing RAM-backed subuid/subgid files.
- matt remains UID/GID 1001; persistent Home host owner 201001:201001. Copied existing Home preserving metadata to approved /mnt/user/mos-desktop/home. Removed broad /mnt/user bind, FUSE/GPU binds and added explicit device denies; retained TUN solely for existing Tailscale. Removed matt NOPASSWD sudo rule; password-authenticated sudo group membership unchanged. Runtime matt CapEff is zero, sudo -n requires a password, sudoers syntax passes. The separately existing ubuntu account was not modified.
- Root-owned persistent pre-start hook verifies mounted pool UUID and Home ownership. Required bind has no optional/create fallback. Actual unavailable-Home test stopped container, moved only dedicated Home temporarily, proved start rejection, restored Home and proved normal restart/readable canary. Later final config restart also passed. Runtime cgroups show memory.max=2147483648, pids.max=512, cpu.max=200000 100000. Tailscale active. Autostart intentionally 0 pending broader recovery/NAS reboot gates.
- Scratch Home restore of .bashrc and mapping canary into a distinct check directory passed content comparison and actual matt read/write access. This is bounded sample recovery, not full application recovery. No NAS reboot or cross-pool backup performed.
- Updated fixed frontend target and confirmation to mos-desktop only, with accurate Stop termination warning and no control for old testit or code. Corrected About/README/release notes. New built-module confirmation/cancel/forbidden-target/close test passes. Windows and independent Linux builds/tests 29/29, built checks and public allowlist 35 files pass; SDK/component pins unchanged. Private migration scripts/config remain ignored.
- Published immutable 0.2.2 source/tag bfa765f8446aa03cbe32854a4a7b5349a5f74a77. Main CI 38149533855 and tag CI 38149622008 pass. Anonymous .deb and source ZIP downloads match independent Linux builds; SHA256/MD5 sidecars pass. Debian SHA256 44e45550adcf3e18a78b36a36d48fceb89fd7b0381285c938dc5bf934e7fac97; source ZIP SHA256 441a68ea28c8502533b519c1e7cb969dd37ac7148b5e67d53717b04ddf6a0ed1 (229046 bytes). Existing Hub entry needs no version edit. No plugin install performed; user Update/full reload and renamed-control observation remain open.
- Next: installed 0.2.2 target confirmation, then scoped M3 bridge/file/terminal implementation. No claim of complete M3 readiness, VM isolation, hostile-code safety, full recovery or SSH acceptance.

## L1 test-only candidate 0.2.3 — 2026-10-11

- User approved preparing/delivering a test candidate for user installation after the SDK review; no SDK acceptance, release/Hub publication or agent installation implied. Public 0.2.2 and frozen runtime/Clock/contracts identities remain unchanged. Local candidate sources are uncommitted.
- Scope: optional compiled SDK layout work-area/freeform mechanics replace host gesture/recovery math. The app supplies policy and reserves a visible bottom 24px strip. Existing controller remains sole semantic dispatcher; profile/Web Locks, v1 layout intentions, save-on-release, cancellation and stable component keys remain unchanged. No docking/tabs/grid UI, atomic multi-window host operation, backend/session change or M3 service implementation in this canary.
- Added only default-feature WASM (no semantic reducer feature), minified paired wrapper, source/artifact SHA-256 provenance and reviewed dependency notices. `scripts/prepare-layout.mjs` is private/local-only and must remain excluded from public source. No raw Rust/SDK implementation, fixture, cache, credentials or source map is in the Debian package. Existing conservative notices include Rust standard-library licenses. Default crate dependency licenses reviewed from locked Cargo metadata and actual LICENSE/NOTICE files; no donor code used.
- First distribution check caught absolute private build paths in WASM. Rebuilt Rust 1.97.1 with remap-path-prefix for SDK root to /sdk and user root to /build, restaged artifacts and passed the unchanged private-path/source-map checks. The expanded built allowlist permits exactly one existing reducer and one layout WASM. The existing reducer source pin/hash remains unchanged; layout provenance explicitly identifies reviewed uncommitted source rather than pretending baseline SHA contains layout.
- Windows and fresh private Linux checkout `/home/matt/code/mos-desktop-layout-candidate-0.2.3` at public source baseline bfa765f8446aa03cbe32854a4a7b5349a5f74a77 pass production build, all 30 tests and compiled distribution checks. Linux initially exposed test URL matching against a parent directory containing layout-; test harness now matches only the asset basename, and final tests pass. No production fallback or boundary weakened. SDK semantic proof artifact was rebuilt afterward and all 20 SDK parity cases still pass.
- Linux `package-local` produces architecture all, metadata-only control with no lifecycle scripts; contents inspected: compiled federation JS/CSS, two WASM assets, manifest, notices and two provenance records only. Second independent package staging reproduces identical bytes. Downloaded Windows artifact SHA-256 matches Linux and sidecar:
  `55004e29c3fda74c37709acb30bff3f51ed40b30fe673ba970912ceb5d218efb`.
- Delivered local file: `artifacts/layout-test-0.2.3/desktop_0.2.3-1+mos-plugin_all.deb` plus `.sha256`. This is not a published GitHub/Hub release; it will not appear as a Hub update. No commits, pushes, tags, releases, NAS changes, software installation or source watchers created. Linux scratch checkout/dependencies/build outputs retained for reproduction; unrelated work preserved.
- Human check after a separately performed test installation: use the same HTTPS/localhost origin and account as the saved layout; verify L1 candidate label/reserved strip; move and resize windows, release and see increasing save count, reload and verify bounds persist above strip; Escape during drag must preserve prior saved position; minimize/restore must preserve content/Clock config. Do not stop backend containers for this layout check. Retain prior 0.2.2 package for rollback and existing layout record. A raw dpkg-only installation is a temporary runtime test on RAM-based MOS, not proof of persistent MOS plugin registration/boot installation.
- Acceptance remains partial: installed L1 behavior, later L2–L4 consumer arrangements, atomic publication and Battle host integration remain open. No claim of full SDK layout acceptance or original roadmap resumption.

## Installed L1 and local arrangement candidate 0.2.4 — 22:01 UTC

- User installed 0.2.3 persistent version folder/template and ran dpkg; supplied query reports install ok installed, with 0.2.2 retained. User reports save/reload and Escape pass. Recovered browser 6854-1 confirmed ready/saved/reserved strip, control released. Boot restoration was not tested. Earlier browser failed logo and WASM fetch; restarting recovered without auth changes.
- 0.2.4 adds app-composed tiling/tabs, explicit right/tab docking preview/apply/cancel and undock; this is not pointer-driven edge docking. One existing WASM reducer privately validates bounded batches; the onChange callback publishes snapshot and arrangement/projection together to Vue. Geometry/intent use the approved default layout WASM, not a second reducer. Stable article/component keys preserve live content; draft Clock form state is now retained after the integration test exposed reset on rearrangement.
- Arrangement intent and window/config/focus intentions are encoded in one bounded schemaVersion 2 record under `mos-desktop:layout:2:<verified scope>`. The same v1-key Web Lock fences old/new writers. Read prefers v2 then v1; v1 remains unchanged after opting into arrangements for rollback. Credential/profile fencing is unchanged. Restore validates through SDK, remaps saved keys to recreated windows, rejects unavailable/incomplete/future membership and disables writes on recovery failure. Records are host intentions, not raw semantic snapshots or shared backend sessions. Failed writes retain the previous complete record and expose retry; no multi-key transaction or synchronous disk durability claim.
- Windows/Linux production build, all 33 tests, compiled boundary checks pass. Mounted tests verify dock preview Escape leaves storage unchanged, successful dock/tab/tile operations, stable nodes and draft text, original floating bounds, v1 preservation, v2 reload, and preserved minimization. Unit checks cover hidden/infeasible projection, unknown/missing-member restore and close collapse. Active minimized tabs fall back to an eligible member without unminimizing; final package rebuilt after this correction. SDK 20 parity cases plus 17 transitions and six frozen hashes pass unchanged.
- Linux scratch build `/home/matt/code/mos-desktop-layout-candidate-0.2.3` retained; local overlay updated only with reviewed product sources/tests. Final packages in `artifacts/layout-test-0.2.4-review2` and `artifacts/layout-test-0.2.4-reproduce2` are byte-identical. Contents inspected: compiled web assets, existing notices/provenance, no source/maps/hooks/secrets. Downloaded package hash matches sidecar: `aa8dfd094c2bb1139b37c726977e0ab9211e1fc3e2faa8f011f0b61dba030159`.
- Deliver ONLY `artifacts/layout-test-0.2.4-review2/mos-desktop-0.2.4-local-test.zip`. Earlier pre-review 0.2.4 files are retained but superseded, not delivered. Existing 0.2.3 ZIP unchanged. Bundle includes numeric tag folder/package/config/checksums/template and staged manual instructions with 0.2.3 rollback. Do not extract directly over existing metadata without backup. No installation/publication/commit/push performed.
- Required human check: same origin/account, two Clock windows; Preview dock right then Escape (no save), preview/apply, Tab windows and use taskbar to select tabs, edit unsubmitted form text and switch arrangements, refresh to restore arrangement, Freeform to restore floating placements, minimize/mode switch without forced restoration. Keep 0.2.3 and the original v1 record. Remaining full acceptance: installed 0.2.4 behavior, Battle adapter/host limits and remaining layout integration scope; M3/file/terminal roadmap remains paused.

# Isolated Playwright browser regression — 2026-10-12

User authorized temporary test-account credentials in private root .env.test and isolated automated MOS UI checks. HTTPS dashboard reachable with HTTP200; UI login succeeded in a dedicated Chromium context and reusable state saved to ignored .playwright/.auth/mos-test.json. Credential values, tokens and state were not printed. TLS checks retained; no personal browser/desktop controlled. Login trace/video/screenshots disabled; generated browser artifacts remain ignored.

Root `npm run test:e2e`: 7/7 passed (authentication + six installed-plugin UI scenarios). `npm run test:e2e -- --project=chromium --no-deps`: 6/6 passed using existing saved state. Covered actual mouse dragging/resizing/release, Escape cancellation, dock preview/apply, tabs/taskbar and applied Clock config through refresh, keyboard move/focus/minimize/close, freeform restoration and minimized-state persistence. All layout interactions use UI events; DOM reads only assert geometry. Layout tests block backend-changing API requests and never operate resource controls.

Initial automation defects: login URL predicate could already match before authentication completed; changed to wait for login button disappearance. Refresh changed scroll offset, so geometry oracle now uses workspace-relative coordinates. Focus reordered frames, so minimize targets stable window label instead of live first index. These were test fixes, not installed-product changes. Final product source unchanged this session.

Root `npm test`: preserved page suite, 33/33 passed. Git ignore verification passed for .env.test, auth state, output/playwright/results and node_modules; credential/state files are not tracked. CLI named isolated session opened, loaded saved state and closed successfully. Official Playwright skill installed locally. No publication/commit/push/install/deployment or unrelated workload change. Tests establish behavior of installed MOS candidate, not uninstalled future source or complete SDK/native acceptance. Original implementation order remains unchanged; routine browser verifications no longer need repeated human checks.

