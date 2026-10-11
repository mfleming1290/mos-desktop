# MOS Desktop — M1

One MOS-first application, eventually presented through the MOS plugin and an authenticated standalone browser route. Both will share host-owned session state. Neither frontend owns native process lifetime.

Version **0.1.2** corrects HTTP startup and corner-layout restoration in the M1 shell: independent Clocks and About, reducer-backed window controls, launcher/taskbar, pointer and keyboard manipulation, cleanup and scoped layout machinery. Published **0.1.0** remains the accepted M0 runtime canary and rollback. M1 acceptance remains partial until actual MOS workflow and authenticated storage-scope integration are verified. No backend, native-app launch or standalone authentication is implemented.

## Local build

Requires Node 24.21.0/npm. Approved compiled inputs in `runtime/` are hash-pinned. No private SDK checkout, credentials or Rust compiler is required. Clock/contracts 0.1.1 are fetched into ignored cache from the already-public Clock plugin at exact commit `a06361b0d40f26bf3a66da1ebe24ea2264efbb23`, verified by SHA-256, then installed through their package interfaces. Only consumed modules enter the frontend bundle; cached archives/fixtures do not enter the plugin. Provenance is in `runtime/identity.json`; SDK source revision, package version and artifact hashes are distinct identities.

```sh
node scripts/prepare-components.mjs
cd page
npm ci --ignore-scripts --no-audit --no-fund
npm run prepare:runtime
npm run build
npm test
npm run check:built
```

Never replace published version bytes. The reviewed source allowlist excludes private SDK source, internal records, caches, fixtures and source maps. Original M0 release/runtime inputs and rollback artifacts remain unchanged. Third-party notices remain in `runtime/THIRD-PARTY-NOTICES.txt`; compiled distribution approval does not grant a public license to private SDK source. Shared Clock/contracts remain version 0.1.1 independently of the plugin version.

The MOS federation exposure is `./Plugin`, using host Vue only. The WASM URL is module-relative. One route controller serializes commands against one accepted snapshot; Vue owns only projection, focus, configuration and gesture previews. Keys are window identities, never revisions or ordering. Minimize keeps content mounted but suspends Clock work; restore returns to normal geometry. Close-last-view disposes the local app. No view action controls a remote process.

Layout storage requires a verified scope and Web Locks. The MOS entry requests the current profile through MOS's established same-origin authenticated API and uses only the server-returned user ID; it does not decode credentials or trust stored display names/user IDs. Credential changes block pending writes, including route-exit flushes; account changes reverify and remount. Missing/denied profile or unavailable Web Locks leaves an explicit memory-only session. Scoped harness tests prove bounded intentions, single-writer ownership, restore, storage failures and account-change fencing, not actual MOS account isolation. Arrow keys on a title move it; arrow keys on its resize handle resize it. Alt+Shift+Left/Right cycles windows, M minimizes, X closes; Escape cancels pointer preview.

## Next gates and rollback

Publication is approved; installation remains user-controlled. Use MOS Hub's normal Update action to install 0.1.2, then reload the page. Local tests do not establish actual MOS pointer, focus, reload or update behavior. Verify two independent Clocks and About, move/resize and window controls, taskbar restore, then refresh to check scoped layout/configuration recovery. The Save layout button confirms successful writes with an increasing session count. HTTP LAN addresses can run the shell using cryptographic random bytes, but missing Web Locks or profile access must report memory-only behavior, not pretend the layout was saved. HTTPS remains recommended; fixing startup does not make HTTP transport secure. Browser layouts are origin-local: hostname, IP, localhost and HTTPS addresses do not share a saved layout.

This is a private homelab application using temporary public Hub distribution, not a long-term public SDK project. Installed operation uses local assets without retrieving SDK source or GitHub build inputs. Making the repository private later may break anonymous discovery, updates and reinstalls even if installed assets continue working. Private/local Hub support remains unverified.

M0 is accepted. M1 does not authorize M2 administration, M3 persistent Home/admission or M4 Selkies integration. Standalone access must authenticate independently and enforce equivalent authorization. Simultaneous input policy must be selected before two-view streaming acceptance.

Use MOS's normal plugin removal controls for rollback. There is no backend service or persistent application data to migrate; do not change unrelated plugins or restart services.

Numeric version tags build through GitHub Actions and publish a complete draft-then-public release with an architecture-independent `all` Debian package, MD5/SHA-256 sidecars and tagged source archive. Main/PR builds do not publish; never replace published version bytes. MOS Hub owns discovery only.
