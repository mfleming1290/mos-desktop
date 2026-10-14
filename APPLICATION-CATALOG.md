# Application catalog source candidate

Unreleased, uncommitted local implementation. Installed MOS0.2.14, accepted
shell source0.2.15 and SDK0.3.0 release artifacts are separate identities.
Packaging is disabled (`mosDesktopReleaseReady: false`). No service configuration
or permissions have been changed. Source approval does not approve installation.

The ordinary Application Library, dynamic Start content and application buttons
query one optional compiled SDK catalog. Existing WASM/controller queues own
running applications and windows. Literal reviewed adapter associations own
configuration validation, availability and presentation. Authenticated operations
remain in `desktop-personal.mjs`. Adding a content type normally adds a small
adapter and one registration; there are no catalog/UI/layout type switches.
The Text Canary demonstrates that seam without file or backend authority.

Instance-policy upgrades that change admitted single/multiple semantics while views
are live are visibly deferred: close all windows for that definition before new
launches apply the updated policy. Existing drafts/identities remain pinned; other
metadata/config updates retain the existing behavior. Availability reads the live
snapshot so closing the last window immediately enables the new policy.

Approval writes validate both retained-record count (256) and serialized size
(262144 bytes) before publishing. Capacity rejection preserves the previous valid
document/revision and keeps the authority writable; no automatic history pruning.

Clock and editor retain their existing packaged implementations. Selkies uses the
existing PersonalStream and fixed `personal` resource: view detach cannot stop a
graphical application. It does not create independently managed sessions.

Web Browser and data presets share PersonalWeb. Supported controls are initial
address and reload. Cross-origin history, redirect interception, popups, strict
fixed-origin enforcement and isolated browser profiles are unsupported. The
opaque iframe cannot access parent credentials. A load event does not establish
successful rendering; the UI keeps content explicitly unverified. External
embedding restrictions are never bypassed. A separate bounded Battle controller browser
slice now passes local Windows/no-MCP proof under the owner's existing-React-style
exception; it does not change the MOS adapter or authorize deployment.

## Data manifests

The Library refreshes the fixed Home-relative `Applications/manifests` directory
through existing authenticated list/read operations. Files are JSON, at most
16KiB each, at most256 entries/two bounded listing pages. Reads request16KiB at
the host too. Refresh publishes one coherent snapshot. Invalid entries diagnose;
duplicates conflict rather than selecting a winner. Partial transport scans keep
the previous snapshot. Visible polling is5s; hiding/disposal cancels/fences it.
No SDK filesystem access, executable imports, dependency installs or file writes.

Descriptor1 follows the build pack: id, label, optional description/category/tags/
builtin icon, connector id/target, instancePolicy, preferredSize, configuration.
For example a web preset uses connector `web`/`browser` and configuration
`{"initialUrl":"https://example.org/","navigationPolicy":"approved-browser"}`.
This policy means the explicitly disclosed iframe subset, not strict enforcement.
`fixed-app` is rejected in this browser host. `selkies`/`personal` accepts only
`{"resource":"personal"}`. `text`/`plain` accepts `{"text":"draft"}`.

Existing views pin their registration/configuration. Removal prevents launches
and retains open content. The semantic definition retires after its last app
closes. Unsupported/missing saved applications preserve the original layout and
disable autosave; they are not silently removed from durable storage. Data-backed
definitions are rediscovered on restore. Unsaved editor/text content is volatile,
as before; this feature does not promise persistent drafts. Authored shell JSON
continues using the original fixed builtin template, independently of catalog data.

## Executable connectors

The optional bridge configuration keys are `connector_discovery` and
`connector_authority`. Both require separately approved deployment to actual
persistent directories. Authority storage must be outside personal Home and
discovery, owned by the bridge operator and not group/world writable. No paths
are accepted from the browser; no files/exec grants or new generic endpoints exist.
Without configuration, Connector Manager explicitly reports connectorUnavailable.

Each installed directory contains `manifest.json` and a self-contained UTF-8
`adapter.mjs` (<=64KiB). Manifest fields are exactly:

```json
{"id":"example","version":"1","abi":1,"context":"isolated-frame","capabilities":[],"moduleSha256":"<64 lowercase hexadecimal characters>"}
```

ID is at most70 ASCII identifier characters. ABI1 exports
`createContentHost({target,configuration})`, returning the existing SDK ContentHost
with `attach({view,session},AbortSignal)` and its attached/unsupported/unavailable
outcome. Attachment owns active/resize/detach. The built-in bootstrap uses the
unchanged `createContentBinding`, not another lifecycle manager. No validator or
top-level connector code executes during discovery, rejection or approval.

GUI uses authenticated `connector.list`, `connector.decide` and
`connector.activate`. One `approvals.json` holds scope/revision/identity, exact
manifest/module hashes, version/context, empty requested/approved host capabilities
and decision. Explicit activation stages and rehashes exact bytes before returning
them. Evaluation occurs only when its admitted view opens, in a sandboxed opaque
iframe. Remote/bare imports are not bundled or installed; unsupported modules fail
to attach. Manager/bootstrap remain builtin and work without modules.

Operator configuration management uses the same authority and CAS implementation:

```text
python connectors.py DISCOVERY AUTHORITY SCOPE
python connectors.py DISCOVERY AUTHORITY SCOPE --decision approved --id ID --identity HASH --revision REVISION
```

These are operator instructions, not commands executed on a live host in this run.
Do not edit approvals.json concurrently with writers. Transactions use an exclusive
lock and atomic replacement, retaining content-addressed previous documents.
Invalid/future/partial records disable writes. A crash can leave approval.lock or
approval.next: inspect and retain the old valid document and orphaned stage data;
an operator must resolve that interrupted transaction before trying again. There
is no automatic stale-lock deletion or destructive reset. Staged files are readonly
and content-addressed; every activation rehashes them. This is operator-owned
integrity, not an OS immutable bit or protection from a malicious bridge operator.

Approval does not activate. Reload requires explicit reactivation; old approval
never admits changed bytes. Disable stops new launches and may retain pinned
views. Revocation removes their frames; it never kills independent backends. GUI
revocation applies immediately on acknowledgement; external operator decisions
are observed on the next5s visible poll and at every new admission. Hidden pages
do not poll; no host operations are exposed to those frames. Authority failures
fence further activations. Removing discovery files leaves pinned views intact.

The opaque frame has no parent storage, MOS token, native IPC or host message
broker. CSP blocks fetch/resources under the initial document and sandbox blocks
top-navigation/popups/downloads. This is not universal network containment: browser
self-navigation and future browser behavior must not be described as a network
sandbox. Hashes prove bytes, not publisher identity or benevolence. Publisher
metadata is unverified. Third-party trust approval remains a human authority.

## Local verification and rollback

`npm test`, `npm run test:shell-ui`, `npm run test:personal-ui`, page `npm run build`
and `npm run check:built` use existing dependencies. Shell UI proof owns loopback
Vite/Chromium and a disposable real file-backed Python connector authority. MOS
authentication/stream/personal services are fixtures there. It exercises catalog
launch/search, retained drafts/frames, disk manifests and actual approved module
render/revoke without rebuilding. It is not installed MOS E6/E10/E12 acceptance.
Linux tests cover actual openat2 read bounds and connector CAS/staging/CLI/
recovery/symlinks. User-provisioned aiohttp cleared the scratch integration gate:
30 tests passed with one optional Landlock skip. Source-only Linux CI38524152722
also passes backend/build checks. Neither is installed candidate acceptance.

Rollback removes only this candidate's source/compiled imports using the recorded
worker diff. Preserve pre-existing untracked/private files. Disable external
activation first; retain approvals, stage artifacts, manifests and layout1/2/shell1
records. Do not stop native jobs, purge data or replace accepted release assets.
