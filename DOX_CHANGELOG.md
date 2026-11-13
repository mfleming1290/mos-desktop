# Orchestration changelog

## 2026-10-11T02:00:36Z — Local MOS runtime integration canary

- Request: Continue implementation after creating the public MOS Desktop destination; SDK-first, MOS consumer, code build host and user-controlled installation.
- Result: partial — established a local M0 paired runtime/federation canary and Linux review package, without M1 shell/backend development. Actual MOS load and public compiled-runtime distribution remain gates. Empty GitHub repo cloned locally; no commit, push, release, Hub registration or NAS change.
- Files:
  - Created:
    - .gitattributes
    - .gitignore
    - AGENTS.md
    - README.md
    - VALIDATION.md
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/vite.config.js
    - page/src/Plugin.vue
    - page/src/runtime-canary.mjs
    - scripts/prepare-runtime.mjs
    - scripts/check-built.mjs
    - scripts/package-local.mjs
    - tests/runtime-canary.test.mjs
    - DOX_CHANGELOG.md
    - .cache/sdk.zip (ignored verified private input)
    - .cache/sdk/ (ignored extraction/dependencies/build cache)
    - page/src/generated/ (ignored paired build outputs)
    - page/dist/ (ignored frontend outputs)
    - page/node_modules/ (ignored build dependencies)
  - Modified: None.
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: passed verified SDK archive/all manifested inputs, Rust 1.97.1 WASM builds on Windows/code.aeyth, production federation builds, four real-WASM/host-Vue/error/late-disposal tests on both hosts, paired asset checks, repeated Linux paired hashes, Debian metadata/inventory, 15 new-file whitespace checks, two JSON files and README local link. SDK stream compatibility and six freeze hashes pass; original runtime/components unchanged. Native/browser/MOS live acceptance not inferred.
- Server: source build mirror and local artifacts under /home/matt/code/mos-desktop; added rustup 1.97.1 minimal toolchain/WASM target under /home/matt/.rustup, default unchanged. No apt, listener or service changes. Complete paths/candidate hashes and preserved first package are in VALIDATION.md.
- DOX: root guidance records M0 limits and routes to validation. Public/private source inputs are ignored; raw SDK not part of public source inventory.
- Remaining: review compiled-runtime redistribution/notices and reproducible public source inputs; authorize scoped publication for user-installed actual MOS M0 gate. M1 and later remain dependency-gated; standalone authentication not implemented.
- Next: Approve the bounded public compiled-runtime distribution/release scope before any remote writes.

## 2026-10-11T02:07:40Z — Temporary public distribution clarification

- Request: Treat MOS Desktop as private homelab software with temporary public Hub distribution; retain compiled-only SDK boundary and no publication/deployment authority.
- Result: partial — documented approved compiled subset, excluded private inputs, and visibility-change implications. Source inspection identified a lifecycle fixture in the local preparation workflow; current candidate is not accepted for distribution pending removal and licensing review. M0 remains partial.
- Files:
  - Created: None.
  - Modified:
    - AGENTS.md
    - README.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: source inspection and new-file whitespace checks for the three guidance files passed; no builds, private-visibility host test, NAS operations or remote writes performed this turn.
- DOX: root scope updated to explicit compiled-only approval and private homelab delivery posture.
- Remaining: remove fixture from local candidate, review licensing/notices and package exclusions, rerun affected local checks; actual MOS loading remains separately gated.
- Next: Finish bounded local distribution validation without publishing or deploying.

## 2026-10-11T02:39:13Z — Compiled-only M0 boundary verification

- Request: Continue local M0 distribution validation without publication, deployment or SDK expansion.
- Result: partial — replaced imported test data with one product-owned workspace command through existing SDK interfaces; Windows/Linux builds and four mounted tests pass. New package creation fails closed because pinned generated protocol registration retains an unnecessary FixtureEnvelope descriptor. No schema, SDK source, component version, commit, remote or NAS change.
- Files:
  - Created:
    - scripts/collect-notices.mjs
    - page/src/generated/THIRD-PARTY-NOTICES.txt (ignored Linux build output)
  - Modified:
    - scripts/prepare-runtime.mjs
    - scripts/check-built.mjs
    - scripts/package-local.mjs
    - page/src/runtime-canary.mjs
    - page/src/Plugin.vue
    - tests/runtime-canary.test.mjs
    - AGENTS.md
    - README.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/src/generated/runtime.mjs (ignored)
    - page/src/generated/runtime.wasm (ignored)
    - page/src/generated/identity.json (ignored)
    - page/dist/desktop/ (ignored production outputs)
    - .cache/sdk/node_modules/ (ignored locked reinstall)
    - .cache/sdk/rust/wasm/target/ (ignored build cache)
  - Moved/Renamed: None.
  - Deleted: None; historical candidates and cached fixtures preserved, excluded from current application imports/provenance.
- Validation: passed original ZIP/manifest checks, Windows/Linux paired builds, production builds and four mounted tests per host, repeated Linux paired/notices hashes, 11-crate license inventory/37 notice sections, 17-file whitespace/JS syntax/JSON/README-link checks. Distribution gate fails on retained test-only descriptor; packaging stops before new staging. Machine-path scan failure corrected with home/SDK remapping. Fresh evaluator source/consumer/package consistency pass confirms blocker remains explicit; no real MOS acceptance claimed.
- Server: only existing code.aeyth build mirror, generated outputs/notices/dependencies/cache updated; no additional installations, services, listeners or NAS changes. Current hashes and provenance recorded in VALIDATION.md.
- DOX: checkpoint and guidance reconciled to passing local execution but blocked distributable candidate.
- Remaining: narrowly approved SDK build-output separation/pruning or existing fixture-free compiled interface; then rerun package checks. Actual MOS loading remains open; M1 not started.
- Next: Obtain direction for the specific test-only descriptor boundary without weakening exclusions or changing frozen semantics.

## 2026-10-11T08:43:05Z — Approved fixture-free SDK build output

- Request: Exclude FixtureEnvelope through a narrow SDK build fix, preserve runtime behavior, complete local M0 checks without commit/push/publication/installation.
- Result: completed local correction — in-memory build transform excludes test-only declaration/registration while preserving verified SDK inputs and retained serializers. Five tests and boundary checks pass on Windows/Linux; two normalized Linux packages compare byte-identical. M0 remains partial on actual MOS loading.
- Files:
  - Created:
    - scripts/prune-fixture.mjs
    - artifacts/review-3/ (ignored Linux candidate/checksum/staging)
    - artifacts/review-4/ (ignored Linux candidate/checksum/staging)
    - artifacts/review-5/ (ignored Linux candidate/checksum/staging)
  - Modified:
    - scripts/prepare-runtime.mjs
    - scripts/package-local.mjs
    - tests/runtime-canary.test.mjs
    - AGENTS.md
    - README.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/src/generated/ (ignored paired assets/provenance/notices)
    - page/dist/desktop/ (ignored production assets)
    - .cache/sdk/node_modules/ (ignored locked reinstall)
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: passed original archive/manifest checks, paired preparation and production builds on both hosts, five tests including full lifecycle result equivalence against unmodified SDK bindings and changed-layout rejection, output exclusions/manifest/hash checks, Linux notices collection, Debian info/contents, review-4/review-5 byte comparison, 18-file whitespace/syntax/JSON checks. WASM binaries unchanged by pruning; current wrapper/package hashes recorded in VALIDATION.md. Fresh source/package/consumer review confirms no second authority or raw private source in candidate.
- Server: existing build mirror and ignored assets/candidates updated only; no toolchain/system installations, services, listeners or NAS changes.
- DOX: checkpoint and guidance updated to passing local package boundary; historical failures/candidates preserved.
- Remaining: actual MOS loading and any separately authorized delivery; no further approved local M0 correction remains.
- Next: Await separate delivery/installation authorization; do not start M1.

## 2026-10-11T09:14:05Z — Approved public M0 release and Hub registration

- Request: Follow MOS Hub publishing quickstart to publish only MOS Desktop so user can install it.
- Result: completed release/catalog scope — reviewed 20-file public source commit d2a9c84637a17bbb65e6af257722b35bd292482a pushed to existing public repository main and immutable numeric 0.1.0 tag; Actions main/tag workflows pass. All four release downloads match fresh public clone builds and checksums. Hub catalog fc4b06b3ee414f618d3026f5710fce2d01c077e0 published. M0 remains partial on real MOS loading; no install or M1 work.
- Files:
  - Created:
    - .github/workflows/build-plugin.yml
    - runtime/runtime.mjs
    - runtime/runtime.wasm
    - runtime/identity.json
    - runtime/THIRD-PARTY-NOTICES.txt
    - scripts/stage-runtime.mjs
    - scripts/check-release.mjs
    - scripts/make-source.py
    - tests/public-runtime.test.mjs
  - Modified:
    - .gitattributes
    - README.md
    - page/package.json
    - scripts/package-local.mjs
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/src/generated/ (ignored compiled staging)
    - page/dist/desktop/ (ignored public-input production build)
  - Moved/Renamed: None.
  - Deleted: None; private-input scripts/tests/evidence and historical candidates retained locally.
- Validation: passed public source allowlist/path/credential scan, Windows public staging/build/four mounted tests/boundary checks; GitHub Actions main 38127391212 and tag 38127445830; fresh Linux clone with isolated npm cache, no SDK/node_modules/Cargo targets, package/source reproduction; anonymous all-release downloads, MD5/SHA256, byte comparison, ZIP/inventory/size and Debian metadata/contents; Hub preservation/URLs/JSON/manifest and public-source syntax/links/diff checks. Upstream license whitespace retained verbatim with per-file whitespace attribute. No actual MOS acceptance inferred.
- Server: added /home/matt/code/mos-desktop-public-release-0.1.0 with public source, isolated npm cache, generated builds/packages/source ZIP and downloaded-release verification files only. No system packages, toolchain, services, listeners or NAS changes.
- DOX: local-only AGENTS/VALIDATION/DOX updated; excluded these internal records and private SDK preparation/pruning/equivalence inputs from public source. Public README owns consumer build/install/rollback instructions; source provenance remains historical SDK identity, not new SDK release.
- Remaining: user installs and observes MOS page Runtime PASS/navigation. No approved release/Hub publishing work remains.
- Next: Await real MOS M0 observation before M1; do not mutate NAS.

## 2026-10-11T09:22:09Z — Real MOS M0 runtime-canary acceptance

- Request: Verify user-installed/open MOS Desktop through the existing terminal browser and supplied screenshot.
- Result: completed M0 runtime-loading gate — existing browser shows expected reducer PASS, Plugins lists MOS Desktop 0.1.0, navigation back and reopening returns the same PASS; browser errors action reports no captured errors. M1 dependency cleared, no M1 implementation. User performed installation; no agent NAS mutation.
- Files:
  - Created: None.
  - Modified:
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: terminal-browser-testing skill read and followed; existing WSL terminal-browser 0.13.4, browser 1572-1/tab 1 at http://localhost/plugins/desktop; initial/final DOM PASS, real Plugins version, safe navigation and empty captured-errors result. Control released and human tab retained. User screenshot independently supports rendering/MOS 0.6.0-stable. Documentation whitespace checks pass; no builds rerun for observation-only changes. No live internal cleanup, installed-file hash recheck or destructive rollback test claimed.
- DOX: local checkpoint and acceptance evidence now distinguish actual MOS rendering/reentry from prior automated lifecycle/integrity evidence. Published runtime/source identities unchanged; internal records remain local/untracked.
- Remaining: No M0 runtime-canary check remains; later M1 and standalone/backend/streaming capabilities are separate work.
- Next: Resume planned M1 only under the applicable implementation authorization; no automatic release or NAS changes.

## 2026-10-11T09:50:36Z — Local M1 shell and bounded verification

- Request: Continue M1 through the Work Ladder; user clarified terminal-browser MOS access uses SSH root@mos localhost:80.
- Result: partial M1 — implemented local reducer-backed shell, static Clock/About hosting, window controls, focus/keyboard, pointer preview/commit/cancellation, presentation/recovery, launcher/taskbar, cleanup and guarded scoped layout intentions. Windows/Linux builds and 13 automated checks pass; private frozen lifecycle equivalence and four supporting checks pass. Actual MOS M1 workflow and authenticated layout binding remain unverified. Installed/published M0, runtime artifacts and SDK/component versions remain unchanged. No M2 or publication/deployment.
- Files:
  - Created:
    - page/AGENTS.md
    - page/src/DesktopShell.vue
    - page/src/desktop-apps.mjs
    - page/src/desktop-controller.mjs
    - page/src/desktop-geometry.mjs
    - page/src/desktop-layout.mjs
    - scripts/prepare-components.mjs
    - tests/desktop-apps.test.mjs
    - tests/desktop-controller.test.mjs
    - tests/desktop-geometry.test.mjs
    - tests/desktop-layout.test.mjs
    - .cache/components/ (ignored verified public archives)
    - .cache/m1-clean-20261011/ (ignored source-only verification staging)
    - .cache/m1-preview/ (ignored earlier local preview)
    - .cache/m1-linux-input.tar (ignored minimal build transport)
  - Modified:
    - .github/workflows/build-plugin.yml
    - README.md
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/package.json
    - page/package-lock.json
    - page/src/Plugin.vue
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/public-runtime.test.mjs
    - tests/runtime-canary.test.mjs
    - page/node_modules/ (ignored dependency install)
    - page/dist/desktop/ (ignored local build)
  - Moved/Renamed: None.
  - Deleted: None; historical runtime/caches/candidates and unrelated work preserved.
- Validation: passed real WASM controller/app/geometry/storage tests and built host-Vue mounting; independent Clock configuration/session stability, pointer preview/cancel/commit, minimize/restore/close/route timer cleanup, late fetch suppression, scoped restore and writer release. Windows Node 24.19.0 and code.aeyth Node 24.21.0 final build/13 tests/boundary checks pass with six byte-identical frontend assets. Fresh public-archive acquisition verifies Clock/contracts SHA256 plus npm integrity; source-only build requires no private SDK. Existing private five-test suite passes including complete frozen fixture equivalence. JSON/syntax/local links/git diff whitespace pass. Release/package helpers intentionally fail closed during unreleased M1, not a functional build failure.
- Server/browser: added only /home/matt/code/mos-desktop-m1-review-20261011 source/build/dependency cache on code.aeyth. No OS packages/services/toolchains/NAS modifications. Temporary Windows/WSL loopback preview servers stopped; SSH-proxied MOS browser could not reach their localhost, so no real-browser M1 pass claimed. Only agent-created tabs closed; original MOS tab retained and control released. Read-only cookie-authenticated MOS profile request returned 401; no credential extraction or workaround attempted.
- DOX: root scope/checkpoint/routes and frontend contract updated; VALIDATION distinguishes local support from live acceptance, records exact unchanged identities and final build hashes, storage fallback, delivery guard and rollback. Internal records remain local/untracked; no commits/pushes.
- Remaining: trusted authenticated MOS profile binding; separately approved immutable M1 delivery/public-source allowlist and notice review; actual MOS workflow acceptance. Default entry is explicit memory-only; no cross-account layout key guessed. No further independent local feature work is required before these integration gates.
- Next: resolve the existing authenticated profile seam, then obtain bounded M1 delivery approval and user-controlled Hub update/testing; do not start M2.

## 2026-10-11T10:06:00Z — M1 profile adapter and storage regression

- Request: Continue approved local M1 implementation while preserving the installed plugin and publication boundary.
- Result: partial M1 — implemented the established MOS profile request adapter with server-id scopes, credential-change write fencing and cancellable account remount. Fixed failed storage reads incorrectly appearing absent. Local tests/build pass; actual installed MOS integration remains pending. No M2, commits, pushes, publication, installation or server changes.
- Files:
  - Created:
    - page/src/desktop-profile.mjs
    - tests/desktop-profile.test.mjs
  - Modified:
    - AGENTS.md
    - page/AGENTS.md
    - README.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/src/Plugin.vue
    - page/src/DesktopShell.vue
    - page/src/desktop-layout.mjs
    - tests/desktop-layout.test.mjs
    - tests/public-runtime.test.mjs
    - tests/runtime-canary.test.mjs
    - page/dist/desktop/ (ignored local build)
  - Moved/Renamed: None.
  - Deleted: None; Vite regenerated only ignored build output.
- Validation: passed Windows production federation build, 17 public/local tests, 5 private compatibility/lifecycle tests, compiled boundaries/runtime/component integrity, local Markdown links, package JSON and git diff whitespace checks. Built entry test verifies account switching cannot flush pending data to the prior account. Initial late-delivery tests needed bounded startup scheduling adjustments; abort/no-resurrection assertions remain intact. Current changes not rerun on Linux or installed MOS; previous cross-host build equality is explicitly historical.
- DOX: updated root checkpoint and frontend authentication/persistence contract; evidence distinguishes upstream contract inspection, simulated profiles, actual MOS acceptance and immutable artifact identity. No actual credentials read or recorded; no new dependencies or runtime versions.
- Remaining: separately approved M1 delivery/new immutable release identity/public-source and notices review, then real MOS workflow/profile/layout verification. Existing published M0 and rollback unchanged; unrelated working changes preserved.
- Next: obtain bounded M1 delivery approval; user-controlled Hub update and acceptance. Do not start M2.

## 2026-10-11T10:13:08Z — Publish M1 0.1.1

- Request: Publish M1; user grants standing future Hub publication approval for this project, not installation or new feature scope.
- Result: completed release/discovery — source/tag 832e3caa8fd9441dfd525125f4c06215b27c39c1, main Actions 38130927584 and tag Actions 38130977272 pass. Public 0.1.1 Debian/source downloads equal clean code.aeyth build; Hub bd3fb1729c0787fef2e56fd80f764d693865593a advertises M1 metadata. Actual MOS M1 acceptance remains partial. Published 0.1.0 rollback and runtime/component artifacts unchanged; no NAS operation or M2.
- Files:
  - Created: None locally beyond regenerated ignored build output; clean code-host checkout and ignored dependencies/build/artifacts at /home/matt/code/mos-desktop-release-0.1.1.
  - Modified:
    - .github/workflows/build-plugin.yml
    - README.md
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - scripts/make-source.py
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/dist/desktop/ (ignored)
  - Moved/Renamed: None.
  - Deleted: None; build regenerated ignored output only.
- Validation: passed Windows build/17 tests and private 5 tests; clean public Linux build/17 tests/package/source replay; main/tag Actions; 32-file exact public allowlist and secret/path/fixture/map/host-Vue boundary checks; unchanged exact Clock/contracts/runtime identities; retained applicable dependency notices. Published all package 159936 bytes SHA256 74363a37104088414e49c681c79227b63c88563f9305f065f93bccc154821581, MD5 2dc9ca6f9f2062621b7dea4bfc0457a4; source ZIP 220270 bytes SHA256 24e22595735ddee4be9a5e194cf841a4c8ca1c3e1a63aec10d1ba42a38a42c03. Anonymous downloads/sidecars match; no maintainer scripts/backend. Documentation links and diff checks pass. Both main branches synchronize 0/0; private records/helpers remain untracked intentionally.
- DOX: root standing publication authority/checkpoint, page distribution boundary and detailed evidence updated. Public commit includes prior reviewed M1 source/tests, excludes private SDK and internal records. This run changed release metadata/guards only, not M1 behavior.
- Remaining: user-controlled update to 0.1.1 and actual MOS pointer/focus/window/layout/profile/reload acceptance; no publication blocker. No OS package/service changes; only coding-host checkout/build caches added.
- Next: Refresh Hub and Update MOS Desktop, then observe M1 workflow; do not start M2.

## 2026-10-11T11:13:04Z — M1 regression corrections and 0.1.2

- Request: Approved corrections for LAN HTTP startup, corner layout restoration and save confirmation.
- Result: completed implementation/publication; M1 actual corrected MOS acceptance remains partial. Source/main/tag 0ff2c57450ec9670554dbecea5dceb07d1d8c71e, release 0.1.2. No NAS mutation, SDK changes or M2.
- Files:
  - Created: clean code-host checkout /home/matt/code/mos-desktop-release-0.1.2 with ignored dependency/build/artifact caches.
  - Modified:
    - README.md
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - page/src/desktop-apps.mjs
    - page/src/desktop-controller.mjs
    - page/src/desktop-layout.mjs
    - tests/public-runtime.test.mjs
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/dist/desktop/ (ignored)
  - Moved/Renamed: None.
  - Deleted: None; ignored output regenerated only.
- Validation: red/green built-module regressions; 19/19 Windows and clean Linux tests, private 5/5 compatibility/lifecycle tests; production builds/boundary checks; main Actions 38134551148 and tag Actions 38134660823 pass. Anonymous four-asset downloads/sidecars match clean Linux replay: Debian SHA256 846e7e2ba84028fc95f55cdfad5d74edcdeb2f7e47e338dfa4b72ab2d831a92b, source ZIP SHA256 73f7d430a4ccc9c159cc5477da6f7db6e0940705177bffe02d7da1fe49983346. Debian metadata/inventory and ZIP integrity pass; existing Hub catalog valid and unchanged. Documentation links/JSON/diff checks pass; main/origin main 0/0. Private local records/helpers preserved untracked.
- DOX: root checkpoint, page HTTP/measured-restore/save contract and evidence reconciled. Exact frozen SDK/Clock/contracts and notices unchanged.
- Remaining: user-controlled Hub update/retest. HTTP layouts intentionally memory-only without Web Locks; records are origin-local. Screenshots establish functional observations, not internal teardown.
- Next: Update MOS Desktop to 0.1.2; check HTTP startup and same-origin secure-context corner save/reload. Do not start M2.

## 2026-10-11T11:47:37Z — Save-on-release and persistence diagnostics

- Request: Implement approved automatic layout saving without a routine Save button; explain unavailable persistence.
- Result: completed implementation/publication of 0.1.3, source/main/tag 9a08b73e1a3a601940f1158e511c70d5b09abfdd. Moves/resizes flush committed geometry immediately; retry only after failure. Specific profile/storage/locking messages replace combined requirements. M1 installed acceptance remains partial; no M2 or NAS changes.
- Files:
  - Created: coding-host /home/matt/code/mos-desktop-release-0.1.3 with ignored dependencies/build/artifacts.
  - Modified:
    - README.md
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - page/src/desktop-layout.mjs
    - tests/desktop-layout.test.mjs
    - tests/public-runtime.test.mjs
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/dist/desktop/ (ignored)
  - Moved/Renamed: None.
  - Deleted: None; ignored output regenerated only.
- Validation: focused red/green loop; Windows/Linux 21/21 public tests and builds/boundaries pass, private Windows 5/5 compatibility tests pass. Main Actions 38136714912 and tag Actions 38136765128 pass. Anonymous Debian/source hashes match independent Linux build: fd3ef28282aeb54e77f9e49a221df952bf8f7275e7841ed1c989bfea01e804fe and fa4728b5c6a2f997f1b72899ea23790a30ef612f745d1a6c29ce01a84f1dfde8. Sidecars, architecture all, ZIP integrity and unchanged catalog/icon pass. Read-only existing localhost browser shows secure context/Web Locks/profile 200 string id and older save UI; no credential/profile values output, control released. Documentation links/JSON/diff checks pass; main/origin main 0/0. Local internal records/private helpers preserved.
- DOX: root checkpoint, frontend autosave/diagnostic contract and evidence updated; unchanged SDK/component pins and notices.
- Remaining: user-controlled update and actual 0.1.3 same-origin save/reload observation. HTTP missing Web Locks remains memory-only; screenshot origin's precise missing requirement not directly inspected. No OS install, listener, service or NAS change.
- Next: Update through Hub; use HTTPS/localhost, move/release and refresh. If temporary mode remains, report its specific reason.

## 2026-10-11T13:49:04Z — Disposable M2 target confirmed

- Request: Use the newly provided disposable testit LXC for bounded management testing; installation of needed tools inside testit is authorized.
- Result: partial — SSH hostname and MOS lxc-info both confirm testit, currently running. Leave code and unrelated workloads untouched. Existing uncommitted read-only M2 implementation is preserved; no container operation or installation performed.
- Files:
  - Created: None.
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: passed — current Windows frontend suite 24/24, including built read-only panel lifecycle and adapter checks. Read-only SSH identity and MOS container-state checks passed. Initial API source lookup missed src; resolved actual route file under /usr/local/lib/mos-api/src/routes. No management API behavior has been tested yet.
- DOX: recorded explicit disposable target authorization; existing contracts still need reconciliation when the M2 slice is delivered.
- Remaining: finish read-only M2 delivery and implement/verify the bounded management slice against testit only. Installed new-panel acceptance remains open.
- Next: Verify MOS start/stop API contract before introducing testit-only controls.

## 2026-10-11T13:56:36Z — Testit-only M2 control implementation

- Request: Continue implementation using MOS individual LXC commands and disposable testit as needed.
- Result: partial — added confirmed testit-only start/stop API controls, serialized requests and explicit unknown outcomes without retry. Real clean shutdown/start recovery passed; testit left running with SSH reachable. No other workload targeted. Existing read-only M2 work preserved.
- Files:
  - Created: None in this continuation; existing untracked M2 modules preserved.
  - Modified:
    - page/src/desktop-mos.mjs
    - page/src/desktop-lxc.mjs
    - tests/desktop-mos.test.mjs
    - README.md
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - page/dist/desktop/ (ignored build output)
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: passed — Windows build, built boundary check, 25/25 frontend tests and diff whitespace check. Verified MOS start/stop routes/service source. MOS SSH clean stop observed STOPPED, start observed RUNNING, testit SSH hostname passed. Live browser control path remains not run.
- DOX: disposable target authorization and local control contract recorded; validation distinguishes host recovery from browser/API proof.
- Remaining: live control UI/API validation, independent Linux build and scoped publication; no plugin installation performed. M2 remains partial.
- Next: Exercise the confirmed testit controls through the browser/API and verify observations before release.

## 2026-10-11T14:03:01Z — M2 partial publication and host conflict

- Request: Continue implementation until a blocker or required human verification.
- Result: partial — published 0.2.0 source/main/tag 1e3c6886f797f46cd6bca2b716cbbbce54149b0f. Live API stop passed but normal start failed with macvlan hardware-address EADDRINUSE. Temporary testit-only start-time MAC override recovered RUNNING and SSH; saved configuration and unrelated workloads unchanged. Installed-panel human verification now required; normal management gate remains blocked.
- Files:
  - Created:
    - coding-host /home/matt/code/mos-desktop-release-0.2.0 and ignored build/download artifacts
    - MOS /tmp/mos-desktop-testit-start.log
  - Modified:
    - .github/workflows/build-plugin.yml
    - README.md
    - scripts/package-local.mjs
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: Windows earlier 25/25 and Linux fresh 25/25 tests/build/boundaries pass. Main Actions 38145483708 and tag 38145531950 pass. Anonymous Debian/source downloads byte-match independent build; SHA256 1a7081abe7e50b2e5551e11ff4c98014c2b4c9e6d96b0b56d81d5218cfea1e3d and ab135c39acfd5db82f13901eea370b9ae7a702f9331eb3ae3e0cf5fbb2567bc2. Sidecars/architecture/ZIP integrity passed. Existing Hub entry correct; main/origin main 0/0. Browser API observed stop200/stopped and start500/stopped; agent control released. Recovery override and final RUNNING/SSH observed. No plugin installation performed.
- DOX: root checkpoint and frontend control contract reconciled; validation records publication and failure separately from previous successful SSH canary.
- Remaining: installed status/Refresh verification and saved-MAC conflict diagnosis before further stop tests; M2 not complete, M3/M4 gated.
- Next: User updates through Hub and verifies new LXC status panel; leave testit running until network conflict is resolved.

## 2026-10-11T14:11:41Z — Accept real MOS underscore names

- Request: Correct failed installed status read and preserve MOS underscore-prefixed container names.
- Result: completed correction/publication 0.2.1, source/tag 6242994a0cc446a7bfc80e7af348cf7c3e66426b. Live GET200 returned 11 items; leading underscore validation caused whole-list rejection. Display accepts it now; control target unchanged. Installed correction acceptance remains partial.
- Files:
  - Created: coding-host /home/matt/code/mos-desktop-release-0.2.1 with ignored build/download artifacts.
  - Modified:
    - page/src/desktop-mos.mjs
    - tests/desktop-mos.test.mjs
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/dist/desktop/ (ignored)
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: Windows/Linux 26/26 tests and builds/boundaries passed. Main Actions 38146096156 and tag 38146136322 passed. Anonymous Debian/source hashes match independent Linux build; sidecars passed. Browser read only, control released. No container mutation or plugin installation. Private records remain excluded.
- DOX: selected version and evidence updated; initial screenshot explicitly records failed read rather than acceptance.
- Remaining: human installed 0.2.1 list/Refresh check; separate saved-MAC normal-start blocker persists.
- Next: Update through Hub and verify populated LXC status list and Refresh; do not Stop testit yet.

## 2026-10-11T14:20:11Z — Installed control test and repeated host failure

- Request: Continue implementation from installed status acceptance.
- Result: blocked management gate — installed list and confirmation/Stop workflow pass; Start fails after stopping even with a replacement MAC saved. Temporary testit-only config experiment rolled back byte-for-byte. testit recovered RUNNING with runtime MAC suffix53 and SSH reachable; no shared networking intervention or unrelated workload mutation.
- Files:
  - Created:
    - .cache/testit-recovery/config (ignored local experiment)
    - MOS /var/lib/lxc/testit/config.pre-mos-desktop-mac
    - MOS /tmp/mos-desktop-testit-start-2.log
  - Modified:
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None; original MOS testit config restored after temporary edit.
- Validation: user screenshot and live browser list accepted. Browser 3022-3/tab1 confirmation preceded Stop; before confirmation RUNNING, after STOPPED in UI and lxc-info. Start/Confirm failed, direct diagnostic EADDRINUSE reproduced. Recovery RUNNING/SSH and original config hash verified. Browser control released. No source change or release; existing 26-test proofs unchanged, not rerun.
- DOX: recorded failure without weakening accepted list/Stop proof; temporary address is recovery, not resolution.
- Remaining: host macvlan lifecycle root cause blocks normal start acceptance and dependent work.
- Next: Choose a separately scoped host networking investigation or isolated testit network replacement; do not restart shared networking or stop unrelated workloads.

## 2026-10-11T14:41:21Z — Testit config correction and control acceptance

- Request: Inspect config as possible cause; authorized isolated testit network correction.
- Result: completed bounded config workaround and management canary. Removed fixed hwaddr and duplicate autostart=0, retained macvlan/default isolation and autostart=1. Ordinary MOS API and installed UI Stop/Start cycles pass without override. testit RUNNING/SSH reachable; underlying host fixed-MAC retention unproven.
- Files:
  - Created: MOS /tmp/mos-desktop-testit-ipvlan.log from rolled-back IPvlan trial.
  - Modified:
    - .cache/testit-recovery/config (ignored)
    - MOS /var/lib/lxc/testit/config
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None; original config backup retained.
- Validation: inspected exact saved config/common include; official LXC manual verified dynamic MAC support. IPvlan trial failed EBUSY and rolled back. Normal MOS API stop200/stopped/start200/running passed. Installed UI confirmation Stop/stopped/Start/running/completed passed; final lxc-info and SSH passed. Browser control released. No shared networking/Docker/firewall change. No software source change/release; prior tests not rerun.
- DOX: root/frontend checkpoints reconciled, validation separates workaround from root cause and bounded canary from whole-phase completion.
- Remaining: reconcile other M2 acceptance before M3; fixed-MAC host diagnosis optional for testit now using dynamic MAC.
- Next: Reconcile M2 build-pack acceptance and choose the next required slice.

## 2026-10-11T14:47:15Z — M2 safety closure and M3 contract gate

- Request: Continue implementation through the next required slice.
- Result: completed bounded M2 safety reconciliation; M3 storage/isolation approval remains pending before provisioning.
- Files:
  - Created: None.
  - Modified:
    - tests/desktop-mos.test.mjs
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: adapter tests passed 6/6; full suite passed 28/28; git diff --check passed. Read-only MOS inventory confirmed mounted Btrfs pool, available capacity, subordinate mapping declarations and running testit. No provisioning or publication.
- DOX: bounded M2 safety state reconciled; optional Binary Manager deferred; privileged broad-bind testit explicitly not admitted as M3 backend.
- Remaining: approve dedicated Home directory and isolated testit repurposing; verify actual mapping allocation and pinned base before provisioning.
- Next: Obtain the concrete M3 storage/isolation decision, then implement only that approved boundary.

## 2026-10-11T15:04:31Z — Permanent backend rename, isolation and 0.2.2 release

- Request: Approve M3 isolation/Home, retain existing matt and rename disposable testit to permanent mos-desktop backend.
- Result: completed bounded rename/isolation/Home migration and frontend publication; M3 service readiness remains partial. Container RUNNING, user/files preserved, required-Home startup refusal and scratch restore pass. New SSH hostname needs human host-key verification; no trust bypass.
- Files:
  - Created:
    - .cache/testit-recovery/mos-desktop.config (ignored)
    - .cache/testit-recovery/check-storage.sh (ignored)
    - .cache/testit-recovery/shift-rootfs.py (ignored)
    - .cache/testit-recovery/sudoers (ignored)
    - MOS /mnt/user/mos-desktop/home/ (preserved Home and isolated restore check)
    - MOS /mnt/user/mos-desktop/recovery/ (protected config/rootfs/Home canary backups)
    - MOS /var/lib/lxc/mos-desktop/check-storage.sh
    - MOS /tmp/mos-desktop-shift-rootfs.py
    - MOS /tmp/mos-desktop-sudoers
    - MOS /tmp/mos-desktop-isolated.config
    - MOS /tmp/mos-desktop-check-storage.sh
    - MOS /tmp/mos-desktop-isolated-start.log
    - MOS /tmp/mos-desktop-missing-home.log
    - MOS /tmp/mos-desktop-restored-home.log
    - MOS /tmp/mos-desktop-final-start.log
  - Modified:
    - .github/workflows/build-plugin.yml
    - README.md
    - page/package-lock.json
    - page/package.json
    - page/plugin.config.js
    - page/src/desktop-apps.mjs
    - page/src/desktop-lxc.mjs
    - page/src/desktop-mos.mjs
    - tests/desktop-mos.test.mjs
    - tests/public-runtime.test.mjs
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - MOS /var/lib/lxc/mos-desktop/config
    - MOS /var/lib/lxc/mos-desktop/rootfs/ (ownership shift and matt sudoers correction)
  - Moved/Renamed:
    - MOS /var/lib/lxc/testit -> /var/lib/lxc/mos-desktop
  - Deleted: None; recovery data retained.
- Validation: runtime UID/GID maps, zero-capability matt, password-required sudo, Home mapped ownership, missing-Home refusal, normal restart, resource limits, Tailscale, and bounded scratch Home restore pass. Windows/Linux 29/29 tests, builds, built checks and public allowlist pass. Main CI 38149533855 and tag CI 38149622008 pass. Published 0.2.2 at bfa765f8446aa03cbe32854a4a7b5349a5f74a77; anonymous downloads byte-match independent Linux build and checksum sidecars pass. Tracked checkout clean and HEAD/origin 0 0 before final record. Host-key verification and installed renamed-control acceptance remain open; no NAS reboot/plugin install.
- DOX: root/frontend scope/checkpoint updated; detailed migration/release hashes and private distribution boundary recorded in VALIDATION.md. No SDK source/pins or unrelated workload changes.
- Remaining: user Hub update/full reload and renamed-control observation; renamed SSH trust verification; M3 authenticated bridge/files/PTY, full recovery and NAS reboot gates. Autostart stays disabled pending recovery gates. Same-pool migration backup is not disaster recovery.
- Next: Verify installed 0.2.2 fixed backend target, then continue scoped M3 services.

## 2026-10-11T20:06:46Z — Local L1 layout test candidate delivery

- Request: Prepare and deliver a test-only MOS candidate for user installation; preserve pending SDK acceptance and existing distribution boundaries.
- Result: completed local candidate preparation/delivery, not installed or accepted. Version 0.2.3 exercises optional SDK workarea/freeform gesture/recovery with a reserved 24px shell strip and existing save-on-release. No Hub/GitHub publication, SDK acceptance commit or original-roadmap resumption.
- Files:
  - Created:
    - page/src/desktop-sdk-layout.mjs
    - runtime/layout.mjs
    - runtime/layout.wasm
    - runtime/layout-identity.json
    - runtime/LAYOUT-NOTICES.txt
    - scripts/prepare-layout.mjs (private/local-only)
    - tests/desktop-sdk-layout.test.mjs
    - artifacts/layout-test-0.2.3/desktop_0.2.3-1+mos-plugin_all.deb (ignored)
    - artifacts/layout-test-0.2.3/desktop_0.2.3-1+mos-plugin_all.deb.sha256 (ignored)
  - Modified:
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - scripts/check-built.mjs
    - scripts/package-local.mjs
    - tests/public-runtime.test.mjs
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None.
  - Deleted: None.
- Validation: Windows and fresh Linux builds, 30 tests and compiled checks pass; default WASM zero imports, pinned license notices/provenance included. Distribution path scan initially failed and passed after Rust path remapping; Linux test harness initially matched parent directory and passed after basename correction. Package contents/architecture/control inspected; second package staging byte-identical; downloaded SHA256 matches 55004e29c3fda74c37709acb30bff3f51ed40b30fe673ba970912ceb5d218efb. SDK semantic artifact restored and 20 parity cases pass. Existing runtime/components unchanged. No live MOS/browser test claimed.
- DOX: existing published checkpoints unchanged; VALIDATION records candidate scope, boundary, hashes and user checks. Unrelated/untracked internal records remain excluded; no staging or commit performed.
- Remaining: user installation and installed L1 interaction/persistence evidence; later layout consumer integration and SDK acceptance remain open.
- Next: User tests this local candidate through HTTPS/localhost; record actual behavior before advancing layout acceptance.

## 2026-10-11 — Local drop-in delivery format

- Request: Supply the local test candidate with MOS persistent plugin metadata and version-folder structure.
- Result: completed packaging only — local ZIP contains desktop/template.json, 0.2.3 Debian package, MD5/SHA256 and plugin.config.js; README provides staged manual activation and rollback. No MOS writes, publication or acceptance.
- Files:
  - Created: scripts/make-local-dropin.mjs
  - Created: artifacts/layout-test-0.2.3/drop-in/ (ignored)
  - Created: artifacts/layout-test-0.2.3/mos-desktop-0.2.3-local-test.zip (ignored)
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed delivery generation with exact prior Debian SHA256 assertion and archive inventory; read-only SSH confirmed existing desktop 0.2.2 metadata/config and absence of settings.json. MOS lifecycle documentation confirms highest-numeric-folder boot selection; rollback instructions explicitly remove candidate folder from selection. No live installation test performed.
- DOX: checkpoint unchanged; candidate remains not accepted.
- Remaining: user-controlled installation and real MOS candidate checks.
- Next: Follow bundled staged activation instructions, then verify L1 interaction and persistence.

## 2026-10-11T21:50:04Z — L1 installed observation and local batch staging

- Request: Continue layout acceptance; user confirms manual installation, save and Escape and supplies a browser.
- Result: partial — user-installed 0.2.3 observed ready/saved/strip after browser restart. Added host-only serialized batch publication; rejection retains the original snapshot, success publishes once and retains all command events. No package replacement or installation performed by agent.
- Files:
  - Created: None
  - Modified: page/src/desktop-controller.mjs
  - Modified: tests/desktop-controller.test.mjs
  - Modified: page/AGENTS.md
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: 31 tests, production build and compiled boundary pass. An attempted unexported generated Result import failed and was replaced by a frozen host-only batch receipt; single dispatch retains its generated result. Browser failures included MOS logo before user restart; direct MOS runtime HTTP 200; recovered browser ready/saved/strip verified and control released. No auth/security changes. Existing immutable local test ZIP remains unchanged and does not contain this batch code.
- DOX: frontend batch contract updated; full layout acceptance remains open.
- Remaining: arrangement UI and durable snapshot-plus-intent transaction, then real consumer checks.
- Next: Integrate bounded arrangement operations and persistence around the local batch seam.

## 2026-10-11T22:04:07Z — Local arrangement integration candidate

- Request: Continue layout implementation and acceptance.
- Result: partial — composed SDK tiling, tabs, explicit docking preview/cancellation and freeform restoration in MOS. One v2 record stores related host intentions while preserving v1 rollback data. Prepared corrected local-only 0.2.4 candidate; no installation, publication, commit or push.
- Files:
  - Created: page/src/desktop-arrangement.mjs
  - Created: tests/desktop-arrangement.test.mjs
  - Created: artifacts/layout-test-0.2.4/ (ignored, superseded candidate retained)
  - Created: artifacts/layout-test-0.2.4-review2/ (ignored, final candidate)
  - Modified: page/src/DesktopShell.vue
  - Modified: page/src/desktop-controller.mjs
  - Modified: page/src/desktop-layout.mjs
  - Modified: tests/public-runtime.test.mjs
  - Modified: page/package.json
  - Modified: page/package-lock.json
  - Modified: page/plugin.config.js
  - Modified: scripts/make-local-dropin.mjs
  - Modified: page/AGENTS.md
  - Modified: VALIDATION.md
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed 33 tests, production build and distribution boundary checks on Windows/Linux; Linux package rebuild byte-identical, final deb SHA256 aa8dfd094c2bb1139b37c726977e0ab9211e1fc3e2faa8f011f0b61dba030159. Tests caught draft reset and storage-string assumptions, both corrected; final review corrected minimized active-tab fallback. SDK parity and frozen hashes pass. No installed 0.2.4 observation; browser tests are mounted JSDOM, not native OS proof.
- DOX: page contracts reconciled; full acceptance remains open.
- Remaining: real MOS 0.2.4 interaction/reload checks and Battle consumer integration; no crash-durable multi-key transaction claimed.
- Next: User installs final review2 bundle using its staged README and checks preview/Escape, tabs, reload and freeform restoration.

## 2026-10-12T00:01:31Z — Isolated Playwright verification workflow

- Request: Install Playwright skill and automate installed MOS UI checks using private temporary credentials, preserving Node tests and work order.
- Result: completed — isolated UI authentication and reusable private state, six real-browser layout scenarios, root test commands and safe CLI debugging guidance. No personal browser, backend resource operations, product source changes or deployment.
- Files:
  - Created: playwright.config.cjs
  - Created: scripts/probe-playwright.cjs
  - Created: tests/e2e/environment.cjs
  - Created: tests/e2e/auth.setup.cjs
  - Created: tests/e2e/layout.spec.cjs
  - Created: tests/e2e/AGENTS.md
  - Created: tests/e2e/README.md
  - Created: .playwright/.auth/mos-test.json (private ignored runtime artifact)
  - Created: output/playwright/results/ (private ignored runtime artifacts)
  - Modified: .gitignore
  - Modified: package.json (user-created root manifest; preserved dependencies)
  - Modified: AGENTS.md
  - Modified: VALIDATION.md
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: HTTPS200 and UI login; 7/7 browser checks pass, then 6/6 pass reusing auth without login; existing Node33/33 pass. Fixed automation login race, scroll-coordinate oracle and focus-reordered selector. CLI isolated named session loaded auth and closed. Secrets/state ignored and untracked; no values printed. Diff whitespace passes. Official Playwright skill installed outside repository via skill-installer; current docs checked through Context7.
- DOX: root routes/workflow and e2e contract updated; original SDK/native acceptance and work sequence unchanged.
- Remaining: Battle integration and final SDK acceptance remain separate; browser suite tests installed candidate only.
- Next: Use automated MOS checks for routine changes and continue existing layout acceptance/Battle integration, then original services roadmap.

## 2026-10-12T01:31:08Z — Resume original ladder and verify installed layout

- Request: Resume original execution with autonomous verification and preserve security/deployment boundaries.
- Result: partial original run; supported L1–L4 verified and source pushed (SDK fcdd078, MOS 553af98, Battle c36c7cd). No release, install or deployment.
- Files:
  - Created/Modified (accepted pending source plus this session's repairs/reconciliation):
    - .gitignore
    - README.md
    - package-lock.json
    - package.json
    - page/package-lock.json
    - page/package.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - page/src/desktop-arrangement.mjs
    - page/src/desktop-controller.mjs
    - page/src/desktop-layout.mjs
    - page/src/desktop-sdk-layout.mjs
    - playwright.config.cjs
    - runtime/LAYOUT-NOTICES.txt
    - runtime/layout-identity.json
    - runtime/layout.mjs
    - runtime/layout.wasm
    - scripts/check-built.mjs
    - scripts/make-local-dropin.mjs
    - scripts/package-local.mjs
    - scripts/probe-playwright.cjs
    - tests/desktop-arrangement.test.mjs
    - tests/desktop-controller.test.mjs
    - tests/desktop-sdk-layout.test.mjs
    - tests/e2e/README.md
    - tests/e2e/auth.setup.cjs
    - tests/e2e/environment.cjs
    - tests/e2e/isolation.spec.cjs
    - tests/e2e/layout.spec.cjs
    - tests/public-runtime.test.mjs
    - tests/AGENTS.md
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed MOS Node33 and isolated browser8; SDK codecs/freeze/framework/component/editor/stream regressions, native layout5 and parity20/stateful17 on Windows/Linux; Battle frontend42, default Rust52, rollback48, remote compilation and IPC2. Exact private Git consumer compiled and tested. Fixed editor scratch isolation and invalid display-scale normalization. No personal backend or streaming acceptance inferred.
- DOX: current checkpoint and evidence reconciled; unrelated pre-existing work preserved.
- Remaining: Phase1 scoped services needs explicit MOS principal selected to own existing matt Home. Temporary test credentials do not establish ownership. Streaming admission and host-connected editor depend on services; later installation requires separate approval. Deferred templates/anchors/edit-lock remain out of scope.
- Next: Ask user to name the owning MOS account; do not request passwords or infer authority from test login.

## 2026-10-12T02:26:17Z — Select matt owner and verify host/container boundary

- Request: Use MOS matt and inspect MOS account restrictions and persistent Home requirements.
- Result: completed diagnosis; owner choice resolved. Live read-only checks distinguish restricted host matt from interactive LXC matt and confirm existing persistent scoped Home. No host SSH grant or second Home is needed for the selected service design.
- Files:
  - Created: None
  - Modified:
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed read-only SSH getent, LXC running state, host/container Home ownership and mount checks. Read local MOS knowledge account/authentication/boot references. No reboot, service mutation, deployment or credentials disclosed.
- DOX: current owner gate resolved; next slice is verified-identity authenticated bridge implementation.
- Remaining: stable MOS principal mapping, file/PTY services, streaming and editor integration; deployment requires separate approval. Reboot recovery is not newly verified.
- Next: Implement admission for MOS matt mapped to existing LXC matt, preserving host restrictions and dedicated persistent Home.

## 2026-10-12T03:48:42Z — Personal-service candidate and autonomous regression checkpoint

- Request: Continue the original ladder using MOS matt and existing LXC matt without account changes or disruptive reboot tests; resume after interruption.
- Result: partial — scoped service, Home/Terminal UI, refresh reattachment and host-injected editor seam implemented and source pushed through1b43f06. Live deployment and full original acceptance remain open; no release, installation or account mutation occurred.
- Files:
  - Created:
    - backend/AGENTS.md
    - backend/README.md
    - backend/home.py
    - backend/terminal.py
    - backend/service.py
    - backend/preflight.py
    - backend/test_backend.py
    - backend/requirements.txt
    - backend/mos-desktop-agent.service
    - page/src/PersonalHome.vue
    - page/src/PersonalTerminal.vue
    - page/src/desktop-personal.mjs
    - page/test-host.html
    - runtime/XTERM-NOTICES.txt
    - tests/desktop-personal.test.mjs
    - tests/editor-host-integration.mjs
    - tests/personal-ui.cjs
  - Modified:
    - .github/workflows/build-plugin.yml
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - README.md
    - package.json
    - page/AGENTS.md
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/vite.config.js
    - page/src/DesktopShell.vue
    - page/src/desktop-apps.mjs
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/AGENTS.md
    - tests/e2e/README.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node36, isolated Linux backend11 with real files/PTYs/mTLS/service restart, fixture-backed browser Home/Terminal including refresh, CodeMirror host seam, SDK editor/stream compatibility, production build and69-file distribution guard. Installed Playwright8 passed against0.2.4, not candidate0.2.5. GitHub CI38200679718 passed; release skipped. Read-only MOS mount/idmap/Home preflight passed; no NAS reboot. Resume reconfirmed clean tracked source and successful CI.
- DOX: catalog, backend route and local contracts reconciled; detailed evidence in VALIDATION.md. Existing unrelated and private work preserved.
- Remaining: scoped deployment/HTTPS/mTLS approval and dedicated owner credentials block live admission; current private test login is not matt. Create-only top-level file policy does not satisfy overwrite/nested mutation/move/trash. MOS JWT logout revocation remains an external security gate. Selkies is absent and requires separate approved installation; dependent streaming and installed editor/full Save remain unaccepted. Full reboot evidence is scoped deferred, not a reason to interrupt workloads.
- Next: Obtain scoped service/bridge/HTTPS installation approval and securely configured MOS matt test credentials, then resume live owner/non-owner and lifecycle verification. Never request passwords in chat or broaden temporary-account access.

## 2026-10-12T04:02:24Z — Owner authentication and approved service staging

- Request: Use new private MOS_MATT credentials and proceed with scoped installation approval.
- Result: partial — dedicated owner authentication and installed browser8 passed. LXC Python venv prerequisite and isolated service dependencies installed; backend candidate staged, not started. MOS host runtime installation encountered an explicit discouraged-package confirmation and was stopped rather than bypassed.
- Files:
  - Created: None
  - Modified:
    - tests/e2e/environment.cjs
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed owner Playwright8/8, private credential-presence booleans, git diff --check, read-only startup/nginx/TLS/LXC inspection. No credentials exposed. Separate owner authentication state remains ignored. Host installer waiting at confirmation terminated; no host runtime package configured. LXC service files staged under /opt/mos-desktop and venv installed; temporary venv probes remain. No service start, ingress reload, account change, reboot or unrelated workload interruption.
- DOX: checkpoint records resolved owner credentials/approval and new scoped host-runtime safeguard.
- Remaining: host bridge runtime decision, certificates/ingress and service start/live acceptance; original file/stream/editor gates remain. Source environment change not committed yet.
- Next: Obtain specific authorization to proceed past MOS's discouraged apt confirmation for python3.13-venv, or use a documented MOS-supported runtime installation path; do not silently bypass the safeguard.

## 2026-10-12T04:32:43Z — Persistent bridge and installed personal-service acceptance

- Request: Use MOS optional Debian packages and supplied startup-hook timing to persist the approved host bridge without rebooting or changing accounts.
- Result: completed scoped persistence/deployment; original ladder partial. Runtime packages retained and installed; protected persistent bridge, private TLS/mTLS and exact HTTPS ingress deployed. Agent runs as existing LXC matt. Installed0.2.5 Home/Terminal and service recovery pass. Source5f78b4a/e80d498 pushed; both CI runs pass without a release.
- Files:
  - Created:
    - tests/personal-live.cjs
    - .playwright/provision-services.py
    - .playwright/start-services.py
    - .playwright/post-start.sh
    - .playwright/live-services.cjs
    - .playwright/live-lifecycle.cjs
    - .playwright/live-ui.cjs
    - .playwright/openat-probe.py
    - .playwright/update-installed-template.py
  - Modified:
    - README.md
    - backend/README.md
    - backend/service.py
    - backend/mos-desktop-agent.service
    - tests/e2e/environment.cjs
    - scripts/check-release.mjs
    - AGENTS.md
    - backend/AGENTS.md
    - tests/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/.auth/mos-matt.json
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node36, updated Linux backend11, installed owner layout/auth8, real owner200/UID1001 and non-owner403. Real file create/read/conflict/traversal and PTY input/resize/detach/reattach pass. Agent restart retains files/refuses stale sessions; bridge restart recovers. Actual installed Home Save As/reopen, terminal keyboard/refresh/confirmed End and reusable live UI test pass. Startup hook repeated safely, nginx validated before graceful reload, package/base compatibility checked, artifact hash verified. CI38204002065 and38204114315 pass. Tracked source clean; private auth/deployment files ignored. Full host reboot not run.
- DOX: current deployment/acceptance reconciled; backend contract and validation own persistence/recovery limits. Ignored deployment scripts are operational inputs, not DOX state; protected copies reside in persistent host storage outside the LXC Home bind. Existing unrelated work preserved.
- Remaining: full overwrite/nested mutation/move/trash require safe product-policy resolution; MOS logout JWT revocation is not provided upstream. Selkies still absent with separate install approval gate; streaming/editor/full Save and standalone presentation remain incomplete. Changed runtime device identity after reboot requires trusted re-admission; container autostart stays off. Small unique canary files retained in Home, failed venv probes retained; no unrelated workload/account changes.
- Next: Resolve existing-file mutation policy before widening Save As; obtain separately scoped Selkies installation approval before live streaming qualification. Keep reboot verification deferred and continue the original ladder at those gates.

## 2026-10-12T04:55:01Z — Approved optimistic atomic Save

- Request: Implement approved existing-file replacement with version conflicts while retaining Save As and access boundaries.
- Result: completed top-level Save slice; original ladder remains partial. Persistent backend and immutable frontend candidate0.2.6 installed. Actual two-view stale conflict preserves unsaved text. Source d8fe08e,6f1fe2c,1e26077 pushed; latest CI38205631880 passes. No release or account change.
- Files:
  - Created:
    - .playwright/live-save.cjs
  - Modified:
    - backend/home.py
    - backend/service.py
    - backend/test_backend.py
    - backend/README.md
    - page/src/PersonalHome.vue
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - tests/personal-ui.cjs
    - tests/personal-live.cjs
    - tests/editor-host-integration.mjs
    - README.md
    - AGENTS.md
    - page/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/update-installed-template.py
    - .playwright/.auth/mos-matt.json
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Linux backend12 including real HTTPS Save/stale409, missing/invalid versions, unsafe types and staging cleanup; Node36; actual fixture browser Save/conflict text retention; real SDK CodeMirror host adapter; build and compiled/public boundary. Installed owner Save200/stale409/Save As409/content preservation, two-view UI Save/reopen/conflict, terminal input/refresh/End and layout/auth8 pass. Non-owner403 retained. Artifact SHA256 verified before install. Initial CI failed manifest version mismatch; corrected manifest and CI38205110685/38205631880 pass. Tracked worktree clean; unrelated untracked work preserved.
- DOX: catalog and frontend contract reconciled with observed installed Save; backend README owns optimistic race/mode0600 policy. Internal records remain intentionally untracked.
- Remaining: nested mutation/move/trash, installed editor, standalone and streaming incomplete. Optimistic Save does not guarantee protection against simultaneous native writes. Selkies installation requires separate approval; reboot verification remains deferred. Small owned canaries retained; no unrelated workload interruption.
- Next: Continue original ladder at unresolved file containment and shared-editor integration boundaries; obtain Selkies installation approval before streaming deployment. No full-run completion claimed.

## 2026-10-12T05:13:00Z — Terminal input and echo latency fix

- Request: Fix visibly batched terminal typing without interrupting existing sessions.
- Result: completed. Fixed25ms input batching deadline replaces resetting debounce; input acknowledgement wakes single-flight output polling, with brief75ms active polling and5second lease renewal. Installed frontend0.2.7 only; backend unchanged. Source ee3e6a1 and4b8908a pushed; CI38206717341 and38206980844 pass. No release/publication.
- Files:
  - Created:
    - .playwright/terminal-latency.cjs
  - Modified:
    - page/src/PersonalTerminal.vue
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - tests/personal-ui.cjs
    - README.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/update-installed-template.py
    - .playwright/.auth/mos-matt.json
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed regression that first failed continuous-input starvation, then passed with80ms response delay, echo during typing and serialized input. Node36, installed browser8, build, compiled boundary,70-file source guard and diff checks pass. Installed baseline first send1268ms with no echo in typing sample; two fixed samples first send28ms, visible echo174ms/172ms. Samples are not an SLA. SHA256 checked before persistent candidate install;0.2.6 and template backup retained. Owned canary PTYs explicitly ended; no backend restart or user-session End.
- DOX: validation and public README reconciled; durable security/ownership contracts unchanged. Existing unrelated untracked work preserved.
- Remaining: current transport remains authenticated HTTP polling; network/server latency still applies. Original ladder gaps unchanged; no full-run completion implied.
- Next: Refresh MOS Desktop to load0.2.7; continue original ladder separately.

## 2026-10-12T06:21:14Z — Sustained terminal control and remaining independent integration

- Request: Repair terminal control loss, verify through isolated browser interactions, and continue the original authorized ladder.
- Result: partial original ladder; all independent authorized implementation completed. Fixed MOS rate-limit-induced false unauthentication through shared request pacing and accurate upstream status handling without authentication caching. Installed frontend0.2.11 and updated only the scoped bridge; user PTYs and the terminal agent were not restarted. Added compiled shared-editor Open/Save and same-origin authenticated standalone presentation. Source through a9e5118 pushed; CI38211913241 passed. No release/publication.
- Files:
  - Created:
    - page/src/PersonalEditor.vue
    - page/src/standalone.mjs
    - page/standalone.html
    - runtime/EDITOR-NOTICES.txt
    - runtime/editor-identity.json
    - runtime/editor.mjs
    - .playwright/update-bridge-rate.py
    - .playwright/compile-editor.mjs
  - Modified:
    - README.md
    - backend/README.md
    - backend/service.py
    - backend/test_backend.py
    - package.json
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/PersonalTerminal.vue
    - page/src/Plugin.vue
    - page/src/desktop-apps.mjs
    - page/src/desktop-personal.mjs
    - page/vite.config.js
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/desktop-personal.test.mjs
    - tests/e2e/isolation.spec.cjs
    - tests/personal-live.cjs
    - tests/personal-ui.cjs
    - AGENTS.md
    - page/AGENTS.md
    - tests/AGENTS.md
    - tests/e2e/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/terminal-latency.cjs
    - .playwright/update-installed-template.py
    - .playwright/.auth/mos-matt.json
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node37, Linux backend14, installed isolated browser9, local browser regressions, actual compiled editor host seam, both production builds and public-artifact checks. Live embedded and standalone workflows passed scoped Open/Save/Save As/reopen, cross-presentation stale-write conflict retention, 480 real keystrokes with retained control and complete echo, refresh recovery and owned-session End. Read-only boot preflight passed; full reboot not run. HEAD and origin/main synchronized; credentials/auth state remain ignored. Existing unrelated untracked work preserved.
- DOX: catalog, page/test contracts and validation reconciled with verified installed behavior and explicit remaining gates; framework rail unchanged.
- Remaining: broader nested/move/trash file policy requires scoped authorization; Selkies installation and dependent streaming acceptance require approval; disruptive host reboot remains deferred. MOS server-side logout revocation and Battle native-editor human evidence are not established by these checks. No remaining independent implementation is actionable within current authority.
- Next: Obtain streaming installation and broader file-operation scope decisions before dependent work; schedule disruptive or native human verification separately.

## 2026-10-12T18:51:29Z — Authorized nested files and scoped Selkies integration

- Request: Install approved Selkies, implement scoped nested folders/moves/recoverable trash, verify autonomously and continue the original ladder without disturbing unrelated workloads.
- Result: partial original ladder; all independent actionable work resolved. Guarded nested mutations pass enabled-kernel CI but MOS lacks Landlock and a tested bubblewrap alternative permits native reparent escape, so those operations remain fail-closed/uninstalled in the active PTY agent. Installed scoped Selkies2.0.0 and final frontend0.2.14; native Save, viewer/controller takeover, isolation and recovery pass. Fixed a real active-window refocus/scroll click-retargeting regression. Source59673f5,9511365,9219053,7144130,31431b8 pushed; final CI38293386260 passes; HEAD/origin0/0. No release/publication.
- Files:
  - Created:
    - backend/streaming.py
    - backend/test_streaming.py
    - backend/run-stream-session.sh
    - backend/mos-desktop-stream.service
    - backend/mos-desktop-stream-agent.service
    - page/src/PersonalStream.vue
    - tests/e2e/stream.spec.cjs
    - .playwright/probe-reparent.py
    - .playwright/inspect-selkies.py
    - .playwright/install-stream.py
    - .playwright/update-stream-bridge.py
    - .playwright/fix-stream-route.py
    - .playwright/probe-stream-boundary.py
    - .playwright/live-stream.cjs
    - .playwright/stream-roles.cjs
    - .playwright/diagnose-home-save.cjs
    - .playwright/stream-package-input.tgz
    - .playwright/stream-initial.png
    - .playwright/stream-input.png
    - .playwright/desktop_0.2.12-1+mos-plugin_all.deb
    - .playwright/desktop_0.2.13-1+mos-plugin_all.deb
    - .playwright/desktop_0.2.13-1+mos-plugin_all.deb.md5
    - .playwright/desktop_0.2.13-1+mos-plugin_all.deb.sha256
    - .playwright/desktop_0.2.14-1+mos-plugin_all.deb
    - .playwright/desktop_0.2.14-1+mos-plugin_all.deb.md5
    - .playwright/desktop_0.2.14-1+mos-plugin_all.deb.sha256
  - Modified:
    - README.md
    - backend/README.md
    - backend/home.py
    - backend/service.py
    - backend/test_backend.py
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - page/src/PersonalHome.vue
    - page/src/desktop-apps.mjs
    - page/src/desktop-personal.mjs
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - tests/e2e/README.md
    - tests/personal-live.cjs
    - AGENTS.md
    - backend/AGENTS.md
    - tests/e2e/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/update-installed-template.py
    - .playwright/.auth/mos-matt.json
    - .playwright/.auth/mos-test.json
    - page/dist/
    - output/playwright/results/
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node37, installed layout/auth9, isolated owner streaming test plus login, embedded and standalone Home/shared-editor workflows and480-key terminal recovery, fixture browser, real stream mTLS/owner boundary and artifact/hash/source checks. Linux backend22 passes with4 explicit Landlock skips on development NAS; enabled-kernel CI independently passes substantive nested/reparent/interruption tests. Stream native input uses20ms key spacing; zero-delay burst ordering is unaccepted, not hidden. Disconnect/network/refresh preserves native xedit PID. Package0.2.14 SHA256ea6aa359e11af0500a44961586f8b6fbaafaa51dfd465b24501822a75caee661 verifies on MOS.
- DOX: catalog/backend/browser contracts and validation reconciled; framework rail unchanged. Existing unrelated untracked work preserved. Private operational probes/auth/artifacts remain ignored. Remote changes are confined to approved container display dependencies/extraction/stream units, persistent bridge stream routing and immutable frontend candidate directories/template; backups retained. Original personal-agent PID1636 and user PTYs1645/1652 remain unchanged. LXC autostart remains off; NAS not rebooted.
- Remaining: nested files require Landlock ABI3+ or a separately reviewed equivalent confinement mechanism; full STREAM2 remains dependency-blocked. MOS-side JWT revocation, deferred safe reboot/backup acceptance, real Battle-native editor and subjective media/native-input checks remain outside verified MOS browser evidence. Audio disabled with upstream opaque-frame AudioDecoder warnings. Templates/anchors/edit-lock remain deferred. No independent authorized implementation remains actionable.
- Next: Decide supported kernel/containment path before enabling nested mutations; arrange deferred reboot/native/media checks separately without interrupting unrelated workloads.

## 2026-10-12T19:21:00Z — MOS-native integration investigation

- Request: Analyze mos-full then mos-nas, trace native mechanisms through frontend/API/backend, document reusable findings and resume any safely unblocked ladder work.
- Result: completed source investigation and reusable integration reference; original ladder remains partial/blocked. Native root-admin file and terminal tools do not satisfy personal scope, JWT logout is client-only, supplied x86 kernel config disables SECURITY while ARM enables Landlock. Persistent packages/hooks and bounded LXC controls remain useful; native backup/restore is disruptive and not a Home-bind backup guarantee. No safe implementation item newly unblocked.
- Files:
  - Created: backend/MOS-INTEGRATION-REFERENCE.md
  - Modified:
    - AGENTS.md
    - backend/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed static frontend/route/service/config cross-check, cited-source existence checks after correcting one LXC UI path, SHA256 capture for four source anchors, documentation whitespace and git diff checks. Node/browser/backend suites not rerun for documentation-only changes; no new live acceptance claimed. Initial Get-FileHash tool unavailable; Node hashing succeeded. Local source copy commit identity not established; documentation snapshot metadata is explicitly distinguished.
- DOX: backend reference routed through existing contract; compact root research finding added. Framework unchanged, unrelated work preserved; research stays local with existing internal documentation and is not added to the public artifact allowlist.
- Remaining: kernel/equivalent containment and MOS JWT revocation unresolved; dependent full STREAM2 and deferred reboot/backup/native/media gates unchanged. No MOS service, account, kernel, security setting or deployment changed; no commit/push or publication.
- Next: Obtain approval for a supported containment/kernel path or separately reviewed equivalent, then rerun scoped admission/mutation tests; arrange deferred disruptive/human checks separately.

## 2026-10-12T19:48:32Z — Revised Tier1 nested files enabled and verified

- Request: Apply explicit single-owner homelab contract; enable practical nested operations/moves/trash on existing kernel after identity/mount/data-safety verification, preserve deployment and continue ladder.
- Result: completed revised Tier1 file implementation and independent regression/closeout; original run retains deferred disruptive/human gates. Landlock is optional extra protection; existing openat2 path checks, normal matt permissions, atomic NOREPLACE moves and recoverable trash remain. Incomplete trash receipts no longer hide valid recoverable entries. Added files-only instance of existing agent code and trusted split routing to preserve original PTYs. Source23a3b5a pushed, CI38299977850 succeeds, HEAD/origin0/0. No release/publication.
- Files:
  - Created:
    - tests/personal-nested-live.cjs
    - .playwright/install-tier1-files.py
    - .playwright/enable-tier1-route.py
  - Modified:
    - README.md
    - backend/README.md
    - backend/home.py
    - backend/service.py
    - backend/test_backend.py
    - scripts/check-release.mjs
    - AGENTS.md
    - backend/AGENTS.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - tests/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/.auth/mos-matt.json
    - .playwright/.auth/mos-test.json
    - output/playwright/results/
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed live UID1001/Home/mount preflight; MOS backend24 tests with one optional Landlock race-hardening skip; installed real UI nested folder/write/move/trash/restore/refresh twice including after recovery; files-service forced-crash automatic restart; Node37, layout/auth9, owner streaming2, embedded and standalone shared-editor/480-key terminal workflows and fixture browser. Public source guard84 files, diff checks and Linux/build CI pass. Original agent1636 and bash1645/1652 preserved. PowerShell nested quoting failures were corrected without credential exposure; no failed product tests hidden.
- DOX: current contract/checkpoint and reference updated for explicit revised acceptance; historical evidence retained. Concurrent native reparent/Save races and effective LXC systemd hardening overrides disclosed. Internal DOX and operational scripts remain local/untracked/ignored per distribution contract.
- Remaining: no independent authorized implementation item. Deferred full host reboot, approved separate Home backup destination and actual Battle-native/human media checks remain unaccepted. Landlock and MOS-wide JWT revocation are optional hardening, not blockers. One Home only, no broad host paths, identity mapping or kernel/security changes. Frontend immutable0.2.14 unchanged; files service enabled inside LXC, container autostart still off. Root-only bridge rollback copies retained.
- Next: Arrange deferred disruptive/backup/native/media checks separately when appropriate; current nested file workflow is usable without manual routine verification.

## 2026-10-12T19:58:11Z — Separate Home backup before planned reboot

- Request: Use owner-selected /mnt/Apps/home-backup before user-managed reboot.
- Result: completed on-demand fixed-path backup and isolated full restore verification. Destination is separate /dev/sdb1; Home remains on /dev/nvme0n1p2. Root-only dated backup and restore copy retained at /mnt/Apps/home-backup/mos-desktop/20261012T195748Z, approximately 2 GiB total. No service stopped or reboot issued.
- Files:
  - Created: backend/backup-home.sh
  - Modified:
    - backend/README.md
    - AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed live filesystem UUID/ownership checks, rsync checksum/metadata dry-run comparisons source-to-backup and backup-to-restore, shell syntax and diff whitespace checks. LXC remains running. No browser/source regression required for this isolated administrative helper.
- DOX: next slice updated; backup contract documented. Existing unrelated changes preserved.
- Remaining: user-managed reboot recovery, actual Battle-native and human media checks. Backup is live-file consistent at comparison, not application snapshot or service-config backup; no schedule/purge added. Container autostart remains off.
- Next: User reboots when ready, then verify recovery and perform trusted re-admission if required.

## 2026-10-12T20:09:32Z — Pre-reboot persistence and source reconciliation

- Request: Reconcile saved work, GitHub and persistent server deployment before user-managed reboot.
- Result: completed bounded MOS Desktop/Battle Widget preservation sweep. Backup helper/docs/public guard committed and pushed as ad8559c; CI38302179657 succeeds, release skipped. Existing Battle Widget unfinished edits retained privately rather than falsely accepted. Root-only recovery directory /mnt/Apps/home-backup/mos-desktop/pre-reboot-20261012T2002Z contains deployment.tar, local-workspaces.tar and complete Git bundles for both repositories. Internal docs/credentials remain private, not public Git content.
- Files:
  - Created:
    - .playwright/pre-reboot-20261012/local-workspaces.tar
    - .playwright/pre-reboot-20261012/mos-desktop.bundle
    - .playwright/pre-reboot-20261012/battle-widget.bundle
  - Modified:
    - scripts/check-release.mjs
    - AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node37, public guard85, staged diff and whitespace checks, Git push and HEAD/origin0/0, Git bundle verification and matching local/remote SHA256 for all three workspace/history archives. Server deployment tar lists successfully; nginx configuration valid; all four container units active/enabled. Verified host services/Home and container rootfs on persistent NVMe, plugin/packages/post-start on persistent boot, Selkies/service executables present, separate backup on sdb1. Filesystems flushed. Get-FileHash unavailable; Node hashing succeeded. Development NAS source staging has no Git repository and is not an additional authoritative checkout.
- DOX: catalog reconciled; existing unrelated untracked work preserved. Final DOX owners also copied privately beside recovery archives.
- Remaining: no reboot issued or runtime recovery acceptance claimed. Container autostart remains off; trusted runtime admission may need refresh. Running PTYs/native processes and unsaved application text do not survive reboot. Actual Battle-native/human media checks remain open. No release/publication or unrelated service changes.
- Next: Save any human-owned unsaved application work, user reboots, then verify scoped recovery.

## 2026-10-12T21:59:14Z — Owner-managed host reboot and scoped recovery verified

- Request: Inspect untouched post-reboot state, recover approved services and verify persistence/workflows.
- Result: completed real host reboot/manual container recovery acceptance. Initial container STOPPED matches configured autostart-off; bridgePID7641, packages/plugin0.2.14 and HTTPS routes recovered automatically. Started only mos-desktop; all four enabled services recovered as existing LXC matt UID1001. Agents retried twice for Tailscale readiness; no configuration/admission repair needed. Recovery documentation pushed as8a75dd0; CI38313913890 succeeds, HEAD/origin0/0.
- Files:
  - Created: .playwright/post-reboot-check.py
  - Modified:
    - README.md
    - backend/README.md
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/.auth/mos-test.json
    - .playwright/.auth/mos-matt.json
    - output/playwright/results/
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed trusted identity/pool/Home/bind preflight, actual service UID checks, nginx configuration, installed layout/auth9 plus owner auth, nested UI create/write/move/trash/restore/refresh, embedded and standalone shared-editor/480-key terminal workflows, owner streaming2 native Save/roles/reconnect/refresh, and both pre-reboot nested proof SHA256 comparisons against separate backup. Public guard85 and diff checks pass; CI succeeds. Initial local PowerShell command-substitution error prevented one PID inspection; corrected read-only command observed bridge successfully, no secret exposure. No new implementation or unrelated service changes.
- DOX: current catalog and public recovery limits reconciled; historical evidence retained. Final private owners copied to separate dated post-reboot backup directory.
- Remaining: actual Battle-native and human streaming/media-quality checks. Audio disabled. Autostart remains off by configuration; no unattended container startup, PTY survival or full rollback claim.
- Next: Human native/media checks when ready; no independent coding remains.

## 2026-10-12T22:49:00Z — Sandboxed streaming settings repair

- Request: Attempt settings fix for latency/quality mismatch versus direct Selkies.
- Result: completed settings transport/default repair, deployed through scoped bridge reload without restarting native xedit221 or personal terminal services. Same-window opaque messages now reach Selkies while parent messages remain rejected. Backend confirms CPU JPEG requested60 FPS, quality40/paintover90; browser cursors enabled. Source2eeb669 pushed and CI38318608514 passes; no release.
- Files:
  - Created:
    - .playwright/update-stream-settings.py
    - .playwright/stream-settings-probe.cjs
    - .playwright/selkies-index.js
    - .playwright/selkies-core.js
  - Modified:
    - backend/streaming.py
    - backend/run-stream-session.sh
    - backend/test_streaming.py
    - backend/README.md
    - tests/e2e/stream.spec.cjs
    - AGENTS.md
    - backend/AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
    - .playwright/.auth/mos-matt.json
    - .playwright/.auth/mos-test.json
    - output/playwright/results/
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node37, default layout/auth9 with two owner stream skips, explicit owner stream3 including native Save/roles/recovery and forged-parent denial, focused MOS Linux streaming5, public guard85, diff check and HEAD/origin0/0. Journal assertion uses server time; missing-file poll retries only expected pending creation. Initial bridge shutdown wait was too short; startup helper recovered and later deployments waited for exit. Root-only deployment backups retained. Existing untracked work preserved.
- DOX: catalog/backend contract and validation reconciled.
- Remaining: delivered frame cadence/subjective latency and separate Battle-native acceptance unmeasured. Launcher60 applies on future start; current connections request60 without native restart. Audio remains disabled.
- Next: Reconnect stream to load repair and compare feel when convenient.

## 2026-10-13T01:50:10Z — NVIDIA-first dual-vendor GPU preflight

- Request: Correct server identity; begin NVIDIA-first GPU/Wayland direction and preserve AMD support for second MOS server.
- Result: partial — read-only host preflight and exact-version primary-source research completed. Current host GTX1660 SUPER6GiB/driver615.71.09 verified; renderD129 maps to NVIDIA PCI01:00.0, renderD128 to Intel. LXC lacks GPU nodes/NVIDIA libraries and denies DRM; installed Selkies2.0.0/pixelflux2.1 exposes Wayland and separate render/encode options. Host NVIDIA DRM modeset/fbdev enabled. No runtime, driver, device or account changes.
- Files:
  - Created: None
  - Modified:
    - AGENTS.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed read-only GPU/version/device/mapping/library/config inspections. Initial remote grep quoting failed harmlessly and was corrected. No GPU rendering/encoding canary or browser regression run; no implementation acceptance claimed.
- DOX: recorded vendor direction and isolated canary next slice; reusable primary-source requirements captured by research agent.
- Remaining: scoped device/library admission, separate Wayland/NVENC canary, browser/isolation/recovery proof and migration; AMD server unavailable pending owner setup. Second server must have fresh identities/keys/storage admission.
- Next: Implement isolated NVIDIA Wayland/NVENC canary without replacing working X11 stream.

## 2026-10-13T02:01:07Z — NVIDIA libraries staged; restart window needed

- Request: Add scoped container GPU support; apps-server credentials available for later AMD work.
- Result: partial — staged64 matching NVIDIA userspace library paths plus GBM backend/EGL vendor selection in persistent LXC /opt/mos-desktop/nvidia-615.71.09. Backed up active config and staged four-node GPU config privately at /mnt/user/mos-desktop/services/before-nvidia-20261013T020036Z. Active config and running services unchanged. Owner-set autostart1 preserved.
- Files:
  - Created: .playwright/gpu-provision.py
  - Modified:
    - AGENTS.md
    - backend/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed host identity/render-device mapping, persistent storage/free-space inspection, expected library presence, live xedit221 unchanged and diff whitespace check. Context7 primary native docs confirm external graphics-driver requirements. lxc-device hot-add failed twice with EOVERFLOW; scoped cgroup allow succeeded but mapped-root mknod returned EPERM. Removed temporary grant immediately; no bypass of container policy attempted. No GPU/browser acceptance claimed; product source unchanged and no commit/release.
- DOX: current restart dependency and library/config locations recorded in nearest owners. Earlier autostart-off descriptions superseded by observed owner-set1.
- Remaining: activate GPU binds during safe mos-desktop-only restart, prove isolated Wayland/NVENC and recovery, then AMD apps-server provisioning/testing. Existing live terminal/native processes must be saved before restart. No host reboot, driver replacement, privileged container or unrelated workload change required/planned.
- Next: Owner confirms current container sessions may end, then apply pending config and restart only mos-desktop.

## 2026-10-13T02:31:00Z — Scoped restart and NVIDIA Wayland deployment

- Request: Restart approved container and continue NVIDIA-first GPU streaming, then independent AMD preparation.
- Result: completed NVIDIA functional slice; partial dual-vendor run. Restarted only mos-desktop with backed-up exact four-node GPU binds. All four services recovered. Matching persistent driver libraries and rootful Xwayland support existing matt Wayland zero-copy NVENC stream. Fixed1280x720/local scaling avoids distortion; CPU runner retained for rollback. Source061a478 pushed, CI38337117535 passes; no release or host reboot.
- Files:
  - Created:
    - backend/run-wayland-session.sh
    - .playwright/deploy-wayland.py
    - .playwright/wayland-probe.py
    - .playwright/apps-auth-probe.cjs
    - output/playwright/nvidia-wayland.png
  - Modified:
    - backend/README.md
    - scripts/check-release.mjs
    - tests/e2e/stream.spec.cjs
    - AGENTS.md
    - backend/AGENTS.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - tests/e2e/AGENTS.md
    - .playwright/gpu-provision.py
    - .playwright/stream-settings-probe.cjs
    - .playwright/.auth/mos-matt.json
    - output/playwright/results/
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed ordinary UID1001 FFmpeg60-frame H264 NVENC and isolated NVIDIA Wayland socket/renderer canaries; live journal zero-copy NVENC; Node37, final combined owner browser11, public guard86, installed runner syntax and diff checks, HEAD/origin0/0. CI Linux backend/build pass. Persistent Btrfs rootfs/services and effective User=matt verified. Native Save, viewer denial, takeover, reconnect/network/refresh and maximize aspect ratio pass. Initial missing NVCUVID/EGL/XKB dependencies diagnosed and repaired. Fullscreen and initial fixed-resolution tests failed old coordinate assumptions; fullscreen reverted, fixed-resolution scaled actual mouse events pass. Added150ms click settling after a lost initial takeover character. No delivered-FPS/subjective-latency claim.
- DOX: catalog/backend/browser owners and reusable integration reference reconciled; historical CPU/autostart-off notes explicitly superseded. Private auth/helpers remain ignored, internal docs intentionally untracked; unrelated work preserved.
- Remaining: AMD provisioning blocked by root@apps.aeyth SSH Permission denied(publickey,password); APPS HTTPS and isolated owner browser login pass. Actual Battle-native and subjective media/native-feel acceptance remain human checks. Dynamic desktop resizing intentionally disabled for rootful compatibility. Host driver/account/security policy and unrelated workloads unchanged.
- Next: Configure authorized root SSH access to apps.aeyth; then inspect fresh GPU/identity/storage boundaries and implement AMD. Compare NVIDIA stream feel when convenient; no routine manual verification requested.

## 2026-10-13T02:48:46Z — Correct AMD MOS connection

- Request: Use aos.aeyth, the working apps MOS connection; apps.aeyth is legacy Arch.
- Result: partial — root SSH to aos.aeyth succeeds. Verified Devuan6/kernel6.18.48-mos and Radeon1002:747e/renderD128. No LXC exists. Persistent container storage is /mnt/data/system/lxc; actual pools are /mnt/data and /mnt/home, not /mnt/user. No remote writes or service changes.
- Files:
  - Created: None
  - Modified:
    - AGENTS.md
    - backend/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed read-only SSH, OS/GPU/device, account, container inventory and mount inspections. Missing primary-host paths confirmed; no credential exposure or policy changes. Product tests not rerun for documentation-only correction.
- DOX: corrected target and storage boundary in catalog/backend owner using writing-for-agents guidance; earlier SSH blocker applies only to legacy target.
- Remaining: select authorized personal Home location on second server before provisioning; NVIDIA deployment unchanged.
- Next: Owner selects dedicated Home under /mnt/home or /mnt/data.

## 2026-10-13T03:10:08Z — AMD dedicated Home and isolated GPU service

- Request: Place personal Home under user-selected /mnt/home; use a fresh Tailscale device login for private connection.
- Result: partial — created /mnt/home/mos-desktop/home on verified persistent pool and fresh Ubuntu noble LXC in existing /mnt/data/system/lxc. New matt1001 executes under0:100000:65536 mapping; Home owner101001/mode700 and required bind/UUID guard verified. Scoped renderD128/TUN binds only. AMD Wayland renderer and VA-API H264 canaries pass; new loopback stream service starts and recovers. Tailscale installed with fresh pending identity mos-desktop-aos, awaiting owner login approval. Source d25329d pushed; CI38340307800 success. Primary NVIDIA deployment and unrelated host services/accounts unchanged.
- Files:
  - Created:
    - .playwright/aos-bootstrap.py
    - .playwright/aos-admit.py
    - .playwright/aos-gpu-probe.py
    - .playwright/aos-install-stream.py
    - .playwright/aos-backend-tests.py
    - .playwright/aos-tun.py
    - .playwright/aos-recovery.py
  - Modified:
    - backend/run-wayland-session.sh
    - backend/README.md
    - AGENTS.md
    - backend/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed mapped matt identity/Home permissions and exact mount, Mesa25.2.8/radeonsi RX7800XT VA-API profiles, FFmpeg60 H264 frames, Wayland GL/socket initialization, active loopback service/User=matt/NRestarts0, scoped stream restart with Home hash preserved, backend25 tests with one optional skip, Node37, shell syntax, public guard86, diff check, CI Linux backend/build and HEAD/origin0/0. AppImage copied without personal data/keys and matched original SHA256. Initial bootstrap quoting, missing Home mount target, AppImage execute bit and mapped /opt parent ownership repaired; early system-bus startup race handled after readiness. Harmless bundled amdgpu.ids-path warning remains. No second-host browser/bridge or full reboot acceptance claimed.
- DOX: catalog and backend owner record current AMD boundaries and enrollment dependency. Tailscale skill guided fresh-node installation/login; writing-for-agents kept checkpoint in existing owners. No secrets/auth URL persisted here.
- Remaining: owner must approve fresh Tailscale device. Then derive new MOS owner ID, service IP, mTLS keys/generation and mount admission; install scoped agents/bridge/browser ingress and perform actual AMD browser regression. No credentials, existing Home data or Tailscale state copied. Container autostart0 retained; host reboot untested. NVIDIA/human media gates unchanged.
- Next: Owner approves mos-desktop-aos login, then resume authenticated second-host integration.

## 2026-10-13T03:39:39Z — Authenticated AMD integration and dual-host closeout

- Request: Continue after fresh Tailscale device approval; finish authenticated second-host services and automated verification.
- Result: completed functional AMD integration and source closeout. Verified new Tailscale identity and independently discovered MOS matt profile. Generated fresh CA/certificates/generation and admitted actual Home; installed matt personal/files/stream agents, protected persistent bridge, validated exact HTTPS ingress and unchanged reviewed frontend0.2.14 payload. AMD journals report Wayland zero-copy1280x720 H264 VA-API. Source87e5137 pushed; CI38342633004 success, release skipped. Primary NVIDIA deployment/native sessions and unrelated workloads untouched.
- Files:
  - Created:
    - .playwright/aos-discover.cjs
    - .playwright/aos-admission.json
    - .playwright/aos-provision-services.py
    - .playwright/aos-start-services.py
    - .playwright/aos-enable-ingress.py
    - .playwright/aos-boundary.py
    - .playwright/aos-restart-bridge.py
    - .playwright/aos-lifecycle.cjs
    - .playwright/aos-final-check.py
    - output/playwright/amd-wayland.png
  - Modified:
    - tests/e2e/environment.cjs
    - tests/e2e/stream.spec.cjs
    - tests/e2e/README.md
    - backend/README.md
    - AGENTS.md
    - backend/AGENTS.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - tests/e2e/AGENTS.md
    - .playwright/stream-settings-probe.cjs
    - .playwright/.auth/aos-matt.json
    - .playwright/.auth/mos-matt.json
    - output/playwright/results/
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node37; AMD combined browser11 including isolated login/layouts/real native Save/roles/network/refresh; embedded and standalone Home/shared-editor Open/Save/Save As/conflicts/480-key PTY checks; nested create/write/move/trash/restore/refresh; real mTLS no-client rejection, wrong-owner403, UID1001, files-only terminal denial and path boundaries. Scoped files/stream-agent/bridge recovery preserves live PTY/xedit and accepts subsequent real terminal input. Original-host layout/auth9 passes without native restart. All four AMD services active; source hashes, protected CA/storage, matched owner/generation, nginx/startup syntax/idempotence, package SHA256, private artifact ignores, public guard86, diff check and HEAD/origin0/0 pass. CI Linux backend/build pass. Prior AMD backend25 had one optional Landlock skip. Screenshot confirms rendered AMD content/aspect; delivered FPS/native feel not measured.
- DOX: reconciled catalog into current state instead of obsolete checkpoints; backend/browser owners and reusable MOS reference record fresh-host differences. Playwright and writing-for-agents skills guided isolated verification and existing-owner documentation. Private bootstrap/auth/internal docs remain intentionally untracked/ignored; unrelated work preserved.
- Deployment notes: Host Pythonu3 was not upgraded to satisfy a u5 venv package. Existing venv module plus retained compatible Debian pip/setuptools wheels bootstrapped persistent dependencies. Initial container venv umask077 caused203/EXEC; readable non-secret runtime permissions repaired it without weakening unit protections. Agent restart counter41 records that initial failure; later operations remain healthy. Missing-client TLS1.3 rejection can surface as RemoteDisconnected, now explicitly classified with a positive authenticated health oracle. Exact package/template/config version and guarded post-start routes persist; no generic privileged browser filesystem endpoint added.
- Remaining: subjective media/native feel and Battle-native acceptance require human observation; audio stays disabled and rootful desktop resolution fixed1280x720. AMD full host reboot remains untested and needs a separate non-disruptive window; its container autostart0 means manual start after reboot. No automatic backup destination or autostart policy change was invented. Stronger containment/JWT revocation and deferred product features remain outside this Tier1 run.
- Next: Owner tries the AMD MOS Desktop stream when convenient; no independent current-target implementation remains. Reopen reboot/autostart only with an approved window/policy decision.

## 2026-10-13T03:45:34Z — AMD pre-reboot safety check

- Request: Check readiness before owner reboot; owner enabled autostart and reports both GPU streams much smoother.
- Result: completed non-disruptive preflight. AMD autostart1, MOS LXC enabled/native persistent directory, required Home/render/TUN binds and all five enabled/active container services verified. Home, protected service runtime/CA, Tailscale state, plugin payload and packages are persistent. Source/docs synchronized through d8ffcba; no service stopped or reboot initiated. Qualitative smoothness feedback recorded without a benchmark claim.
- Files:
  - Created: None
  - Modified:
    - backend/README.md
    - AGENTS.md
    - backend/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed read-only storage/permissions/state checks, deployed source/identity consistency, startup/guard shell syntax and inspected native MOS boot ordering. Recovery canary SHA256 e095630f311d645ca16669c47f8fbd786be5bfcd75b2b0b4ba04e9e09301b2f8 retained as baseline. Diff check and source push pass. No application tests rerun for documentation-only change; new documentation CI not awaited or claimed passed. Existing untracked/private work remains saved locally and intentionally outside public Git.
- DOX: owner-enabled autostart supersedes historical off/manual-start notes; human smoother-stream observation recorded in current owners using writing-for-agents guidance.
- Remaining: save unsaved editor/native-app work before reboot; PTYs and native processes do not survive. Automatic AMD host recovery remains unverified until actual owner reboot. Battle-native acceptance remains separate.
- Next: Owner reboots AMD server, then report it is back without manually starting services so automatic recovery can be observed.

## 2026-10-13T04:00:04Z — Actual AMD reboot; web-route hook repaired

- Request: Verify recovery after owner reports server back; observe automatic state before intervention.
- Result: partial automatic recovery, repaired functional state. Container/autostart1, all five services, bridge process, Tailscale identity and exact pre-reboot Home canary recovered without intervention. Initial browser9/11 and personal Home failure exposed missing nginx routes: an assertion rejected an already-existing persistent backup after ephemeral nginx reset. Corrected persistent hook creates the backup only if absent and continues route restoration. Original backup preserved; bridge/native services never restarted. Validated graceful nginx reload restored routes; final browser11 and personal workflows pass. Documentation8863493 pushed, CI38344199577 success; release skipped.
- Files:
  - Created:
    - .playwright/aos-repair-boot-hook.py
    - .playwright/test_aos_startup.py
  - Modified:
    - .playwright/aos-start-services.py
    - backend/README.md
    - AGENTS.md
    - backend/AGENTS.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - .playwright/.auth/aos-matt.json
    - output/playwright/results/
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: automatic-state read-only checks, deployed source/CA/identity/storage consistency and real mTLS/wrong-owner/path checks passed before repair. Initial layout/auth9 passed, streaming2 failed because routes absent; personal Home failed. After repair: actual post-boot route restoration and second no-op invocation pass with unchanged backup hash; isolated regression recreates nginx config twice and asserts one route each, preserved original backup and exactly one reload per reset. Final combined browser11, embedded and standalone Home/editor/480-key PTY checks, nested create/write/move/trash/restore/refresh and deployed consistency pass. CI Linux backend/build, diff check and HEAD/origin0/0 pass. No claim that the fixed hook has yet run automatically on a fresh reboot.
- DOX: current catalog/backend contract distinguish recovered services/data from repaired ingress; reusable MOS reference records persistent-backup/ephemeral-config trap. Playwright and writing-for-agents skills guided verification and owner updates. Private hook/regression remain saved locally and on persistent service storage as appropriate, not public package content; existing unrelated work preserved.
- Remaining: one final owner-managed AMD reboot to confirm automatic invocation of corrected hook. Save unsaved native/editor work first. Battle-native acceptance remains separate; qualitative GPU smoothness confirmed earlier, not a measured FPS claim.
- Next: Owner reboots AMD again when ready, then reports back without manual service starts; no independent repair or regression work remains.

## 2026-10-13T04:47:08Z — AMD automatic reboot recovery confirmed

- Request: Verify the owner's second reboot without manually starting services.
- Result: completed. Container, all five services, bridge, both nginx routes and Tailscale recovered automatically; Home canary hash unchanged. No start, restart, reload or repair performed this turn. Documentation2aad86e pushed; CI38348049125 passed with release skipped.
- Files:
  - Created: None
  - Modified:
    - backend/README.md
    - backend/MOS-INTEGRATION-REFERENCE.md
    - backend/AGENTS.md
    - AGENTS.md
    - .playwright/.auth/aos-matt.json
    - output/playwright/results/
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed read-only boot state, deployed source/CA/owner/storage checks, real mTLS/wrong-owner/path boundaries, all11 isolated browser tests including native stream Save/roles/recovery, embedded and standalone editor/480-key terminal workflows, nested create/write/move/trash/restore/refresh, release guard86 files/version0.2.14, diff check and HEAD/origin0/0. Test canaries retained in Home. Primary NVIDIA services untouched.
- DOX: current catalog/backend owner and reusable MOS reference now record verified automatic recovery; writing-for-agents guidance kept current proof separate from historical repair. Existing private/untracked work remains local and intentionally outside public Git.
- Remaining: None for this MOS recovery rung. Separate Battle-native acceptance remains open; deferred product features and optional hardening remain outside this run. Qualitative smoothness is not a latency/FPS benchmark.
- Next: None actionable within this reboot-recovery scope; no further reboot or routine human check required.

## 2026-10-13T07:30:28Z — Final docs and private backup reconciliation

- Request: Close the original run's docs, save/commit relevant work and publish updated SDK privately with ZIP.
- Result: completed MOS Tier1 reconciliation and private backup. Completion map/validation now agree that AMD automatic reboot recovery passes. Public source visibility unchanged; source/DOX/research plus credential-free startup regression are backed up in private mfleming1290/mos-desktop-private. Private SDK0.2.0 release and updated guides are available in existing battlemoon-desktop; unchanged0.1.0 retained. Battle source committed/pushed privately at ff764da.
- Files:
  - Created: None
  - Modified:
    - AGENTS.md
    - VALIDATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: documentation reconciled with prior actual post-reboot browser11, personal/nested and identity/storage evidence; no MOS service or workload changed this turn. Private backup source files scanned for credential-like material; env/auth/key/certificate/user-data paths excluded. SDK final clean extraction passed; repeat/fresh-checkout ZIP bytes and downloaded assets match. Battle frontend42/Rust52/rollback48/IPC2/build/fmt pass; isolated native mount passes but input automation fails Illegal invocation.
- DOX: writing-for-agents guidance used to separate current proof from dated history and MOS completion from unrelated Battle acceptance. Local private DOX files remain outside public source Git and are committed via the private backup snapshot.
- Remaining: one human Battle development editor input smoke; not a MOS Tier1 blocker. Deferred templates/anchors/edit-lock/audio and optional hardening remain out of scope; second-host personal-data backup destination not invented.
- Next: No independent MOS implementation work remains; perform human Battle input smoke when convenient.

## 2026-10-13T13:15:00Z — Local shell consumer integration

- Request: Integrate SDK345506c shell capabilities in MOS first, preserve personal workflows, test real consumer persistence/actions and leave changes uncommitted for review.
- Result: completed local browser composition; deployed acceptance remains open. Actual SDK Rust/WASM supplies templates/grid/anchors/edit/profile mechanics. Existing host queue admits launch/reveal, preserving app identities/content/geometry. Separate identity-fenced Web Locks/localStorage CAS reconciles failed acknowledgements without replay and blocks unsupported/uncertain destructive saves. Existing layouts and deployed0.2.14 remain untouched. No install, restart, release, pin change, commit or push.
- Files:
  - Created:
    - SHELL-INTEGRATION.md
    - page/shell-test-host.html
    - page/src/ShellLayout.vue
    - page/src/desktop-shell-storage.mjs
    - page/src/desktop-shell-template.mjs
    - runtime/SHELL-NOTICES.txt
    - runtime/shell-identity.json
    - runtime/shell.mjs
    - runtime/shell.wasm
    - scripts/prepare-shell.mjs
    - tests/desktop-shell-storage.test.mjs
    - tests/shell-ui.cjs
  - Modified:
    - AGENTS.md
    - DOX_CHANGELOG.md
    - package.json
    - page/AGENTS.md
    - page/package.json
    - page/src/DesktopShell.vue
    - scripts/check-built.mjs
    - tests/public-runtime.test.mjs
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node39, embedded/standalone builds and artifact/private-path checks, isolated Chromium shell clicks/keys/pointer/focus/forms/retained identity/content, move/resize/reorder/save/reload/lock/reset/import/export, simultaneous cross-view CAS, stale/failed/confirmed and unresolved acknowledgement recovery, credential denial/profile separation/future preservation/transformed-host rejection. Existing personal UI editor and sustained terminal/rate-limit/standalone workflows pass with fixture services. Actual browser storage/action/reducer authority is exercised; auth/profile/personal APIs remain fixtures, not deployed acceptance. SDK source hashes/immutable0.2.0 and cross-repository regressions pass. Fresh read-only review found no blocking defect; diff check passes. Ignored build/cache outputs regenerated; packaging intentionally disabled pending source acceptance.
- DOX: current catalog and page contract reconciled with local candidate; SHELL-INTEGRATION.md owns evidence, full inventory and deployment boundary. Pre-existing untracked guidance/tools preserved; deliberate additions to existing untracked AGENTS/page AGENTS/history are distinguished in report. SDK remains clean.
- Remaining: source/UX acceptance, separately authorized versioning and exact server/package/persistent-backup/rollback installation approval. No native/live authentication/streaming or physical-monitor acceptance claimed; Battle host API-only subset is documented in its repository.
- Next: Review local composition and supported envelope; retain deployed0.2.14 and immutable SDK0.2.0 rollback.

## 2026-10-13T18:09:09Z — Acceptance review before SDK update

- Request: Defer Battle native integration, review reports and exercise MOS integrated workflows before deciding SDK update readiness.
- Result: partial integration acceptance; one confirmed P2 consumer defect, no SDK-core blocking finding. Start activation fails to reveal an existing inactive tab while the ordinary taskbar reveals the same window/retained draft. Hold the planned integrated-source acceptance/final SDK update until a focused adapter repair and regression pass. No implementation fix, commit, push, release, pin change or deployment.
- Files:
  - Created:
    - .playwright/review-shell-tabs.cjs
  - Modified:
    - AGENTS.md
    - SHELL-INTEGRATION.md
    - DOX_CHANGELOG.md
    - page/dist/ (ignored local build outputs)
  - Moved/Renamed: None
  - Deleted: None
- Validation: standards/integrity and spec review used current HEAD plus new untracked integration files, preserving unrelated work. Passed MOS39, existing isolated shell UI, fixture-backed personal editor/terminal/standalone, both builds/check:built; SDK native6/shell83/type/DOM/profile/both browser compositions, freeze6/snapshot/boundary/archive3. Source/artifact hashes verified. Additional isolated browser assertion failed: Clock hidden after Start, identity and en-GB draft retained; ordinary taskbar control reveals same identity. Diagnostic servers/contexts stopped. Full SDK extraction not rerun this review; no live auth/service/native acceptance inferred.
- DOX: writing-for-agents guidance records the new defect in current owner/report without weakening installed0.2.14 proof. Code-review/Playwright skills guided independent standards/spec review and real browser reproduction. MOS version/allowlist/readiness gate remains separate from SDK source-package readiness; Battle is deferred.
- Remaining: reuse internal tab-selection/reveal logic in the shell's queued existing-app path without nesting queues; add inactive-tab shell launch regression and rerun. Final clean SDK build/reproducibility/private release awaits subsequent authorization; exact live deployment approval remains separate.
- Next: User authorizes focused MOS repair, then re-review before planned SDK update.

## 2026-10-13T18:15:30Z — Repair shell activation of inactive tabs

- Request: Fix the confirmed MOS adapter defect, verify it and leave all changes uncommitted without deployment/release.
- Result: completed focused repair. Shared revealArrangedWindow selects inactive arrangement tabs before reveal within the current queue; taskbar and shell reuse it without recursive queueing. Start and keyboard icon activation reveal the original Clock identity/draft; freeform restores remembered bounds. No SDK/Battle implementation changes, commit, push, deployment, release or production pin changes.
- Files:
  - Created: None
  - Modified:
    - page/src/DesktopShell.vue
    - tests/shell-ui.cjs
    - SHELL-INTEGRATION.md
    - AGENTS.md
    - DOX_CHANGELOG.md
    - page/dist/ (ignored local build outputs)
  - Moved/Renamed: None
  - Deleted: None
- Validation: original failing review-shell-tabs diagnostic now passes with visible Clock/same identity/en-GB draft. Expanded isolated shell browser suite passes both Start and Enter icon activation, original identity/focus/content and freeform bounds. MOS39, fixture-backed personal editor/terminal/standalone, both frontend builds/check:built, SDK freeze6 and diff check pass. Focused final source review confirms both call sites share the existing behavior and no nested serialized action. Test-owned servers/contexts stopped; no live backend/native or full SDK extraction rerun for this host-only change.
- DOX: writing-for-agents guidance updates current direction and report to close the review finding while retaining prior failing evidence. Installed0.2.14 proof and packaging/deployment gates remain unchanged; unrelated dirty work preserved.
- Remaining: source acceptance/authorized final SDK preparation; MOS package version/allowlist reconciliation and exact live deployment approval remain separate. Battle native integration stays deferred.
- Next: Accept repaired local integration before committing/pushing and preparing the new SDK distribution under subsequent authorization.

## 2026-10-13T18:33:00Z — Deliver accepted shell source and private backup

- Request: Reconcile, commit and push current work and create the new private SDK version.
- Result: completed MOS source scope — accepted local shell/fix committed and pushed as4922c84, numeric source candidate0.2.15. Linux CI passes with release skipped; no MOS tag, deployment, service restart or installed0.2.14 change. Private documentation/research backup remains separate from public source.
- Files:
  - Created:
    - page/shell-test-host.html
    - page/src/ShellLayout.vue
    - page/src/desktop-shell-storage.mjs
    - page/src/desktop-shell-template.mjs
    - runtime/SHELL-NOTICES.txt
    - runtime/shell-identity.json
    - runtime/shell.mjs
    - runtime/shell.wasm
    - tests/desktop-shell-storage.test.mjs
    - tests/shell-ui.cjs
  - Modified:
    - README.md
    - package.json
    - page/package.json
    - page/package-lock.json
    - page/plugin.config.js
    - page/src/DesktopShell.vue
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/public-runtime.test.mjs
    - AGENTS.md
    - page/AGENTS.md
    - SHELL-INTEGRATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed MOS39, isolated shell browser Start/icon/tab/CAS/profile workflows, personal editor/terminal/standalone regression, both builds/check:built and public allowlist96. CI38447163198 passed Linux backend/build/tests/compiled package/source boundaries, release skipped. SDK0.3.0 clean extraction and independent consumers passed; fresh GitHub checkout reproduced identical ZIP.
- DOX: current catalog, frontend contract and integration report reconciled. Internal records remain excluded from public source and are backed up privately.
- Remaining: None for accepted source delivery; live shell deployment requires separate exact approval. Battle native UI remains deferred.
- Next: Finish private SDK asset publication/download verification and private source/documentation backup.


## 2026-10-13T22:17:09Z — Local catalog and approved connector activation

- Request: Execute the ordered registry/connectors Work Ladder, prioritize early Library, prove E11/real E12 and preserve existing work without install/deployment/source publication.
- Result: partial overall host target; working local catalog/library/Start/picker, reviewed trusted/web/personal-Selkies/text adapters, bounded disk manifest discovery and actual approved isolated executable rendering/revocation. No pending-only activation substitution. Installed0.2.14 remains unchanged; candidate packaging disabled.
- Files:
  - Created:
    - APPLICATION-CATALOG.md
    - backend/connectors.py
    - backend/test_connectors.py
    - backend/test_home_read_bounds.py
    - page/src/ApplicationLibrary.vue
    - page/src/PersonalWeb.vue
    - page/src/ConnectorManager.vue
    - page/src/InstalledContent.vue
    - page/src/desktop-catalog.mjs
    - page/src/desktop-web-content.mjs
    - page/src/desktop-text-content.mjs
    - page/src/desktop-stream-content.mjs
    - page/src/desktop-installed-content.mjs
    - page/src/desktop-application-discovery.mjs
    - page/src/desktop-connector-controls.mjs
    - runtime/catalog.mjs
    - runtime/content.mjs
    - runtime/content-bootstrap.mjs
    - runtime/catalog-identity.json
    - runtime/CATALOG-NOTICES.txt
    - scripts/prepare-catalog.mjs
    - tests/connector-fixture.py
    - tests/desktop-catalog.test.mjs
  - Modified:
    - AGENTS.md
    - page/AGENTS.md
    - backend/AGENTS.md
    - backend/home.py
    - backend/service.py
    - page/package.json
    - page/src/DesktopShell.vue
    - page/src/ShellLayout.vue
    - page/src/desktop-apps.mjs
    - page/src/desktop-personal.mjs
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/shell-ui.cjs
    - page/dist/ (ignored local builds)
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: backend/__pycache__/ (task-created bytecode only)
- Validation: passed Node42, both frontend builds/check:built, prospective118-file source audit, real browser catalog/search/draft/frame/layout/discovered-entry reload, actual disposable disk add/update/remove and file-backed approval/render/resize/revoke without rebuilding. Personal editor/terminal/standalone browser fixtures pass. Linux ordinary-user stdlib5 pass actual openat2 bounds, CAS/CLI/restart/reapproval/conflicts/corruption/symlink/staging checks. Auth/service transport fixtures and local approval are not installed MOS evidence. Full Linux aiohttp integration blocked by missing dependency on existing WSL/code.aeyth; no install attempted. Fresh source/security/complexity review repaired idle timer, memory-only launch and publication-order regressions; final suites/diff/JSON/links pass.
- DOX: current root/frontend/backend owners and APPLICATION-CATALOG.md reconcile opt-in source, pinned views, original shell-template preservation, approval trust/recovery and browser limits. Existing private/untracked work preserved.
- Remaining: installed E6/E10/E12 require exact candidate/host/backup/root approval and deployment; native Battle browser needs Astryx/package authority; full Linux service integration dependency-blocked. Independent-session E7 is deferred; single-session personal resource remains sufficient.
- Next: Review uncommitted candidate and pack WORKER-REPORT.md; no source publication, live service/grant change or release is authorized.

## 2026-10-14T03:27:03Z — Clear native-browser blocker in consumer direction

- Request: Honor the bounded existing-React Astryx exception and reconcile native browser continuation without changing MOS deployment/install authority.
- Result: completed documentation reconciliation; Battle native browser controls now pass supported local Windows/no-MCP proof. MOS product source, installed0.2.14, personal services and candidate package gate are unchanged.
- Files:
  - Created: None
  - Modified:
    - AGENTS.md
    - APPLICATION-CATALOG.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: native source/build/browser and Battle regression evidence is owned by ../battle-widget/docs/evidence/phase-2/native-browser-controls.md and the pack WORKER-REPORT.md. MOS source was not changed or retested for this documentation-only continuation; earlier verified Node42/local E11/E12 subsets remain preserved. Diff checks pass.
- DOX: current checkpoint/next action and guide remove the superseded Astryx/package blocker; broader native shell/UI and installed gates remain distinct.
- Remaining: installed E6/E10/E12 require exact deployment/candidate/backup/root approval; Linux aiohttp integration remains dependency-blocked; independent-session E7 stays deferred.
- Next: Review uncommitted candidate and updated report before separately authorizing any install/deployment. No package, service, permission, commit or release action.

## 2026-10-14T05:02:05Z — Repair catalog policy and approval capacity

- Request: Implement the three fresh acceptance-review fixes with focused regressions, preserving uncommitted work and deployed services.
- Result: completed local MOS repairs. Active single/multiple instance-policy upgrades are visibly deferred until last close; subsequent launches reconcile the definition. Approval writes reject record/byte overflow before publication while retaining valid authority and history. Battle native close/reset repair is owned by its report.
- Files:
  - Created: None
  - Modified:
    - backend/connectors.py
    - backend/test_connectors.py
    - page/src/desktop-catalog.mjs
    - page/src/DesktopShell.vue
    - tests/desktop-catalog.test.mjs
    - tests/shell-ui.cjs
    - APPLICATION-CATALOG.md
    - AGENTS.md
    - page/AGENTS.md
    - page/dist/ (ignored local builds)
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None in repository; task-owned remote scratch test copy removed.
- Validation: passed Node43, both builds/check:built and real browser policy-defer/draft/last-close/two-instance regression plus M1/E11/local E12. Current backend scratch suite under desktop LXC matt1001 with user-provisioned aiohttp3.9.1 ran31:30 pass, one optional Landlock skip. Capacity regression preserves bytes/revision/writable state and permits updates at full history. Final source review/diff checks pass. No live Home/services/config or approval grants changed.
- DOX: behavior guide/frontend contract/root checkpoint reconciled; former aiohttp blocker cleared for scratch tests. Historical worker results retained.
- Remaining: installed E6/E10/E12 need exact deployment/candidate/host/backup approval; E7 deferred. SDK artifacts unchanged.
- Next: Choose approved versioned deployment inputs only under a new request; no commit, push, package or deployment performed.

## 2026-10-14T06:45:00Z — Optional design and source-delivery verification

- Request: Implement the approved design plan, finish automated checks and save/push current work with the new SDK.
- Result: completed local design integration; source0.2.15 remains an uninstalled candidate. Namespace-projected pack CSS and host bindings style existing Library/connector/personal/window/shell surfaces without a new component framework. No live service or permission change.
- Files:
  - Created/Modified:
    - .github/workflows/build-plugin.yml
    - APPLICATION-CATALOG.md
    - DESIGN-INTEGRATION.md
    - README.md
    - backend/connectors.py
    - backend/home.py
    - backend/service.py
    - backend/test_connectors.py
    - backend/test_home_read_bounds.py
    - package.json
    - page/package.json
    - page/src/ApplicationLibrary.vue
    - page/src/ConnectorManager.vue
    - page/src/DesktopShell.vue
    - page/src/InstalledContent.vue
    - page/src/PersonalWeb.vue
    - page/src/ShellLayout.vue
    - page/src/desktop-application-discovery.mjs
    - page/src/desktop-apps.mjs
    - page/src/desktop-catalog.mjs
    - page/src/desktop-connector-controls.mjs
    - page/src/desktop-installed-content.mjs
    - page/src/desktop-personal.mjs
    - page/src/desktop-stream-content.mjs
    - page/src/desktop-text-content.mjs
    - page/src/desktop-web-content.mjs
    - page/standalone.html
    - runtime/CATALOG-NOTICES.txt
    - runtime/DESIGN-NOTICES.txt
    - runtime/catalog-identity.json
    - runtime/catalog.mjs
    - runtime/content-bootstrap.mjs
    - runtime/content.mjs
    - runtime/design/identity.json
    - runtime/design/mos-desktop.css
    - runtime/design/mos.css
    - runtime/design/universal.css
    - scripts/check-built.mjs
    - scripts/check-release.mjs
    - scripts/package-local.mjs
    - tests/connector-fixture.py
    - tests/design-ui.cjs
    - tests/desktop-catalog.test.mjs
    - tests/shell-ui.cjs
    - AGENTS.md
    - page/AGENTS.md
    - scripts/prepare-design.mjs
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed Node43, both builds/check:built,125-file public source guard, scoped actual Chromium light/dark contrast/input-boundary/focus/isolation/narrow390px/200% text/media and retained editor identity/draft, shell M1/E11/local E12 and personal editor/terminal/standalone browser fixtures. Rounded workspace corners initially changed context hit testing; original rectangular hit area restored and full shell harness passed. Auth/service fixtures are not installed acceptance.
- DOX: root/frontend direction reflects current source/private-release authorization and optional styling boundaries. Prior user-owned work preserved; private docs/tooling stay outside public Git.
- Remaining: remote Linux CI/private backups and SDK clean-source release; installed E6/E10/E12 require exact deployment approval. Native shell/independent sessions stay deferred.
- Next: Push reviewed source and preserve private documentation/research snapshot; do not install this candidate.

## 2026-10-14T07:12:00Z — Close source and private backup delivery

- Request: Save/push reviewed MOS design/catalog source, finish automated verification and retain installed approval gates.
- Result: completed source/private backup delivery; source1599a44 is pushed, source-only Linux CI succeeds, SDK0.4.0 is privately released and byte-verified. Installed0.2.14 and services remain unchanged.
- Files:
  - Created: None
  - Modified:
    - APPLICATION-CATALOG.md
    - README.md
    - AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: source-only CI38525160202 success with publication skipped; prior local43/both builds/design/shell/personal browser tests and125-file public allowlist pass.142 source/private files plus original design/ignored planning/SDK receipts backed up;296 private Git blobs retain exact hashes. No backend runtime grants or live acceptance inferred.
- DOX: current next slice is separately approved exact deployment; historical source checkpoints retained. Private root/frontend docs are saved outside public source.
- Remaining: None for source/design delivery. Installed E6/E10/E12 and post-update recovery need exact host/candidate/hash/roots/backup/rollback approval; native shell/independent sessions remain deferred.
- Next: Select deployment inputs only under separate approval, or continue the bounded human native queue.

## 2026-10-14T13:46:45Z — Prepare exact live design frontend update

- Request: Update live MOS Desktop to inspect the SDK design translation.
- Result: partial — immutable frontend0.2.15 prepared; both hosts confirmed on0.2.14 with identical retained rollback packages. Exact targets/candidate/persistent backup/rollback selected for approval; no live installation or service mutation.
- Files:
  - Created: artifacts/design-live-0.2.15-20261014/ (ignored candidate and checksums; failed Windows-mount staging retained)
  - Modified:
    - DESIGN-INTEGRATION.md
    - page/dist/ (ignored rebuilt assets)
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed both builds,43 Node tests, local Chromium design workflow, package asset-boundary checks, Debian metadata/content inspection and git diff --check. Initial WSL Windows-mount package failed permissions; Linux-filesystem packaging passed with SHA256946a352ad71b458dd2762a9dfdc39cbe07167532833c234b2ae147d3b356f92a. Temporary source packaging flag restored to its original false value.
- DOX: existing installed checkpoint remains valid; exact proposed deployment is recorded in DESIGN-INTEGRATION.md without claiming live acceptance.
- Remaining: explicit exact deployment approval, persistent backups, frontend installation and live embedded/standalone browser check. Backend/catalog authority and deferred native work remain outside this request.
- Next: Approve both existing hosts for the named frontend candidate and retained0.2.14 rollback.

## 2026-10-14T13:54:23Z — Approved live design frontend installation

- Request: Install the approved exact0.2.15 frontend on MOS and AOS and verify live design translation.
- Result: completed — both installed packages and persistent boot templates select0.2.15. Root-only persistent frontend backups retain old boot trees/settings/template/packages and web/documentation archives;0.2.14 remains rollback. No SDK/public release, backend, container/GPU/identity/grant change or service restart.
- Files:
  - Created:
    - artifacts/design-live-0.2.15-20261014/template.json
    - artifacts/design-live-0.2.15-20261014/verify-live.cjs
    - output/playwright/design-live-mos-embedded.png
    - output/playwright/design-live-mos-standalone.png
    - output/playwright/design-live-aos-embedded.png
    - output/playwright/design-live-aos-standalone.png
  - Modified:
    - DESIGN-INTEGRATION.md
    - VALIDATION.md
    - AGENTS.md
    - page/AGENTS.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed checksum/dpkg/metadata checks on both hosts; remote entry/design provenance hashes equal approved build; recovery archive readable, old packages retained and settings unchanged where present. Both LXCs/four personal/files/stream units remain running. Actual embedded/standalone Chromium passes host theme/contrast/scoped controls/Library search-launch/editor draft-identity/arrangements/Clock/host-header checks without backend mutations; installed layout/auth9 per host passed,2 opt-in stream checks skipped per host. Screenshots visually inspected. A checksum recheck initially lacked its working directory and verified no file; rerun from the package directory passed. git diff --check passed before recording.
- DOX: root/frontend checkpoints and validation/design owners reflect installed0.2.15 frontend-only evidence; backend E6/E10/executable E12 and native/hardware remain distinct.
- Remaining: None for requested live design update. Subjective owner visual approval and separately scoped backend/native/deferred tasks remain outside this installation.
- Next: Owner open MOS Desktop and hard-refresh if needed to inspect the live design.

## 2026-10-14T14:13:44Z — Push live design verification and private deployment backup

- Request: Push the latest MOS Desktop changes to GitHub after owner confirmed seeing the design.
- Result: completed source push at08e65e15b09575ff946fc82047cb50f22564be03; design implementation was already pushed, and the new commit adds live0.2.15 verification. Public guide excludes private host/backup paths. Private operational docs and reviewed package/script are retained separately; no new release tag, deployment or SDK change.
- Files:
  - Created: None in public source; private operations/frontend-0.2.15-20261014/ contains the selected credential-free deployment backup.
  - Modified:
    - DESIGN-INTEGRATION.md
    - DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: passed125-file public allowlist and git diff --check; explicit public commit/push, remote main hash equality and clean tracked source status verified. Prior live design/layout/auth checks retained; no code changed or browser rerun needed. Source-only GitHub CI38578627388 was in progress when recording; do not infer its result. Private backup excludes env/auth/Home/keys/unrelated files.
- DOX: existing frontend checkpoint remains current; source publication and private deployment evidence stay distinct from numeric package publication/backend acceptance.
- Remaining: None for requested source push; asynchronous CI result remains separate.
- Next: Continue using installed0.2.15; numeric GitHub package release requires a separate request.

## 2026-10-22T06:57:02Z — Diagnose AOS stream JSON error with saved browser credentials

- Request: Use the existing Playwright/saved-credential setup to inspect the apps stream failure without server changes.
- Result: partial diagnosis — authenticated HTTPS browser connects successfully twice: stream.attach POST returns200 application/json, iframe mounts; follow-up confirms visible stream overlay and received server settings. HTTP unauthenticated POST to the same operation endpoint returns403 text/html, consistent with the configured HTTPS-only boundary and reported JSON parse symptom. User browser origin is not yet confirmed, so HTTP mismatch remains a supported explanation rather than a proven root cause.
- Files:
  - Created: .playwright/probe-aos-stream.cjs (ignored isolated redacted probe)
  - Modified: DOX_CHANGELOG.md
  - Moved/Renamed: None
  - Deleted: None
- Validation: existing dedicated AOS login setup passed; two real browser Connect checks passed, with explicit non-takeover attachment and follow-up UI disconnect. No credentials/capabilities/raw auth headers captured or printed. Read-only SSH HTTP request confirms403 text/html. No configuration edits, service restart, native input, implementation fix, commit or deployment.
- DOX: prior deployed checkpoint preserved; no new architecture/contract needed for an unconfirmed user-origin mismatch.
- Remaining: confirm whether user's failing tab is HTTP or another origin; if already on the verified HTTPS origin, capture that distinct reproduction before selecting a fix.
- Next: Open the configured HTTPS apps desktop and retry Connect stream.

