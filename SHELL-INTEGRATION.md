# Local shell consumer integration

Status: accepted local source candidate0.2.15, 2026-10-13. Owner authorized
source commits/pushes and private SDK0.3.0 distribution. No installation, MOS
release tag, production pin change, service action or account change.
Installed MOS0.2.14 remains rollback. This document owns local integration
evidence; VALIDATION.md continues to own deployed evidence.

Source delivery reruns pass MOS39, isolated shell and personal browser workflows,
both frontend builds, compiled assets and public-file allowlist. Packaging now
includes shell notices/provenance. Earlier uncommitted/disabled-packaging
statements below describe the original integration checkpoint.

Delivered public source:4922c844e94e2e2895e5bf557c127bf96ea465cc.
Linux CI38447163198 passes isolated backend tests, build, Node tests, compiled
checks, Debian packaging and source-artifact boundary; release job is skipped.

## Source and composition

Baseline: MOS main2aad86efadd9fb03080e9821218bdec4eddabcaf, SDK
codex/github-portability345506ce0daffde227fca8866abb86e6cee14fb4.
scripts/prepare-shell.mjs stages the actual SDK TS wrappers and remapped pure
Rust WASM, with source/artifact SHA256 in runtime/shell-identity.json. Existing
runtime/layout/editor/Clock assets and pins are unchanged. This is local staging,
not a finalized SDK distribution. Build both presentations with
`npm --prefix page run build`; verify with `npm --prefix page run check:built`.
Packaging is intentionally blocked by mosDesktopReleaseReady=false while the
existing numeric version remains0.2.14; never install these bytes as that release.

ShellLayout.vue supplies a declarative product template with optional SDK grid,
anchored Start/calendar/context surfaces, and existing registered applications.
The existing host queue rechecks scope/credentials/cancellation on launch and
reveals an existing identity before considering a new one. Reopening retains
remembered bounds and mounted content. Popup dismissal does not dispose apps.
Existing files, editor, terminal, streaming and workspace contracts remain owned
by their existing modules. Shell lock affects authoring only.

Edit enables pointer movement, Shift-drag resizing, arrows/Shift-arrows and
explicit reorder; Save commits overrides, Cancel discards preview, Lock disables
authoring, Reset removes only that profile's override. Export emits the SDK
template document; Import previews a supported template without silently saving.
Fixed grid membership remains immutable; reorder affects priority/tab order.

## Persistence and supported envelope

The existing verified host scope and credential fence admit real browser storage.
An exclusive Web Lock encloses read/compare/publish of one synchronous localStorage
record at mos-desktop:shell:1:<scope>. Each confirmed write gets a new UUID receipt.
This is atomic across cooperating same-origin browser views, not remote/server
storage or protection against arbitrary scripts bypassing the adapter. Existing
layout1/layout2 records are untouched and recoverable. Storage remains separated
by origin, browser profile and verified MOS profile.

A thrown publication reads back under the same lock: exact new receipt confirms
commit, exact previous record confirms failure, unreadable/divergent data latches
recovery and disables further saves. No blind replay. Reload explicitly reconciles
the persisted state. Future/malformed records remain unchanged; unsupported import
stays in the JSON textarea and blocks destructive saves until Cancel. Missing
scope, storage or Web Locks does not silently downgrade to durable success.

Only the SDK's unscaled DOM envelope is supported. Transformed/zoomed ancestors
or visual viewport scaling explicitly disable shell projection/actions; ordinary
application windows remain available. No native-DPI, transformed DOM or cross-device
sync claim. Browser date input behavior is the browser's native form behavior.

## Verification on this candidate

| Check | Result and evidence boundary |
|---|---|
| `npm test` | Passed39/39; actual compiled reducer, built federation/Vue, arrangement/auth/layout regressions and storage faults |
| `npm --prefix page run build` | Passed embedded and standalone |
| `npm --prefix page run check:built` | Passed allowlist, identities, three WASMs, notices/private-path checks and identical presentation WASM bytes |
| `npm run test:shell-ui` | Passed actual source consumer+WASM in isolated Chromium, real Web Locks/localStorage and host action queue |
| Shell interaction coverage | Clicks, keys, pointer movement, four-corner context, anchoring, Escape/focus, calendar input, existing Clock identity/bounds/draft retention, move/resize/reorder/save/reload/lock/reset/import/export |
| Shell failure coverage | Credential changed before launch denied; two concurrent views give one CAS winner; stale/before-write/confirmed lost-ack/unreadable-ack/profile/future-record recovery; transformed root rejected |
| `npm run test:personal-ui` | Passed editor Open/Save/Save As/conflict/reopen, sustained480-key/xterm input and rate-limit control, standalone auth, detach/reattach/explicit end |
| Backend/installed streams | Not rerun; unchanged backend, installed services and active streams untouched |

Auth/profile and personal-service responses in isolated browsers are fixtures.
Storage/CAS, geometry, UI and existing host reducer/actions are real local consumer
workflows. Fault injection is explicit test setup. These tests are not deployed MOS
authorization, live file writes, PTY execution or streaming/native-media acceptance.
The implementation checkpoint's read-only evaluator found no blocking integrity/
security defect. A later acceptance review found the consumer behavior defect below.

## Acceptance review — 2026-10-13 (finding resolved below)

Battle native integration is explicitly deferred. SDK source345506c remains clean
and compatible; no SDK-core defect was found. Hold integrated-source acceptance
and the planned final SDK update until the MOS tab-reveal regression is resolved.

P2: DesktopShell.vue shellLaunch existing-app branch calls revealWindow without
selecting the target's inactive arrangement tab. Start/icon activation can therefore
report success while leaving the existing application hidden. The original taskbar's
activateWindow performs the missing selection before reveal.

Actual isolated Chromium reproduction: launch Clock, enter en-GB as draft locale,
open About Desktop, Tab windows, activate About through the taskbar, then use Start
to open Clock. Clock remains hidden with its original identity/draft intact; clicking
Clock on the ordinary taskbar reveals that same identity. Diagnostic:
`rtk proxy node .playwright/review-shell-tabs.cjs` (expected assertion fails on this
candidate). Browser/auth are isolated fixtures; no live server or user data touched.

Repair should reuse one internal queued tab-selection/reveal operation for shell
and taskbar activation, without nesting serialized action queues. Add a regression
covering shell activation of inactive tabs with retained identity/content, then rerun
consumer and SDK checks. No implementation fix was made by the review.

Fresh checks passed: MOS39, existing local shell browser suite, fixture-backed
personal editor/terminal/standalone workflows, embedded/standalone builds and
check:built; SDK native6, shell83 oracle/parity, DOM/profile checks, both Chromium
compositions, strict types, freeze6, snapshot, boundary and archive3 tests. Source/
compiled artifact hashes match. Full fresh source-pack extraction was not repeated
in this review; prior extraction evidence does not convert the new failing workflow
into acceptance. Task-owned test servers/contexts were closed.

MOS packaging remains separately disabled by mosDesktopReleaseReady=false; its
release allowlist/version/notices need reconciliation before a MOS package. That
is not an SDK-core blocker. Live deployment still needs exact approval and rollback.
No commit, push, deployment, release or production pin change occurred.

## Focused tab-reveal repair — 2026-10-13

Resolved the review finding: revealArrangedWindow now performs the existing
inactive-tab selection and reveal inside the current host queue. Both taskbar
activation and shell existing-app activation use it, without recursively enqueuing
an action. SDK code, action admission, application identity and storage are unchanged.

The original failing .playwright/review-shell-tabs.cjs diagnostic now passes:
Start reveals the same Clock identity with en-GB draft retained. The permanent
tests/shell-ui.cjs regression exercises both Start and keyboard icon activation
from an inactive tab, checks visible/focused original identity and retained draft,
and verifies returning to freeform restores remembered bounds.

After repair passed npm test39, test:shell-ui, fixture-backed test:personal-ui,
embedded/standalone builds and check:built, diff check and SDK check:freeze6.
No live backend/native/installed test or full SDK extraction was rerun for this
host-only fix. SDK remains clean. The focused review finding is closed; source
acceptance/final SDK preparation can proceed separately from MOS packaging and
deployment approval. All changes remain uncommitted; no push/release/deployment.

## Acceptance and later installation

- Review local Start/calendar/context and authoring workflow; confirm remembered
  application content and normal locked-mode interaction suit the intended UX.
- Accept the source and the stated DOM/origin persistence envelope.
- Confirm native/media input and physical-monitor checks separately where needed;
  existing deployed evidence is not evidence for this new candidate.
- Authorize commit/version/distribution only after review. No new SDK release yet.

No live installation is requested now: this is intentionally an unversioned local
review candidate. Before requesting installation approval, identify the exact MOS
server (original NVIDIA or second AMD), accepted version/package SHA256, exact
frontend assets/metadata and persistent backup paths. Back up current
/boot/optional/plugins/desktop/template.json and retain the entire0.2.14 directory
and package; preserve origin-local layout1/2 and shell record exports separately.
Rollback must reinstall retained0.2.14 and restore metadata, moving a newer numeric
candidate directory outside the plugin scan path. Validate the server's actual
paths before proposing commands. Frontend-only installation must not restart
bridge/LXC/native services, reboot, change security/accounts/storage, or touch
unrelated workloads. Approval must explicitly name that bounded installation.

## Changed and untracked inventory

Session modifications to tracked files:

```text
package.json
page/package.json
page/src/DesktopShell.vue
scripts/check-built.mjs
tests/public-runtime.test.mjs
```

Session-created untracked files:

```text
SHELL-INTEGRATION.md
page/shell-test-host.html
page/src/ShellLayout.vue
page/src/desktop-shell-storage.mjs
page/src/desktop-shell-template.mjs
runtime/SHELL-NOTICES.txt
runtime/shell-identity.json
runtime/shell.mjs
runtime/shell.wasm
scripts/prepare-shell.mjs
tests/desktop-shell-storage.test.mjs
tests/shell-ui.cjs
```

Pre-existing untracked files modified deliberately in this session: AGENTS.md,
page/AGENTS.md, DOX_CHANGELOG.md (catalogue/local contract/history additions only).
All other pre-existing untracked paths remain user-owned and untouched:

```text
.claude/skills/playwright-cli/SKILL.md
.claude/skills/playwright-cli/references/element-attributes.md
.claude/skills/playwright-cli/references/playwright-tests.md
.claude/skills/playwright-cli/references/pr-attachments.md
.claude/skills/playwright-cli/references/request-mocking.md
.claude/skills/playwright-cli/references/running-code.md
.claude/skills/playwright-cli/references/session-management.md
.claude/skills/playwright-cli/references/storage-state.md
.claude/skills/playwright-cli/references/test-generation.md
.claude/skills/playwright-cli/references/tracing.md
.claude/skills/playwright-cli/references/video-recording.md
VALIDATION.md
backend/AGENTS.md
backend/MOS-INTEGRATION-REFERENCE.md
scripts/collect-notices.mjs
scripts/prepare-layout.mjs
scripts/prepare-runtime.mjs
scripts/prune-fixture.mjs
tests/AGENTS.md
tests/e2e/AGENTS.md
tests/runtime-canary.test.mjs
```

Ignored build/cache outputs were regenerated; no package/release artifacts were
finalized. No tracked/untracked source files were deleted or renamed.
