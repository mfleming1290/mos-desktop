# MOS Desktop 0.1.0 — M0 runtime canary

One MOS-first application, eventually presented through the MOS plugin and an authenticated standalone browser route. Both will share host-owned session state. Neither frontend owns native process lifetime.

This plugin implements only the M0 runtime integration canary, not a desktop shell or standalone authenticated service. No MOS token, backend access or native launch capability is present. Actual MOS loading remains unverified; M0 is partial and M1 is gated.

## Local build

Requires Node 24.21.0/npm and Python 3; Linux dpkg-deb for packaging. Approved compiled inputs in `runtime/` are hash-pinned. No private SDK checkout, source download, credentials or Rust compiler is required. Public builds verify/reuse the compiled interface rather than regenerate private SDK implementation. Provenance is in `runtime/identity.json`; SDK source revision, package version and artifact hashes are distinct identities.

```sh
cd page
npm ci --ignore-scripts --no-audit --no-fund
npm run prepare:runtime
npm run build
npm test
npm run check:built
npm run package:local
cd ..
python3 scripts/make-source.py
node scripts/check-release.mjs --artifacts
```

Linux packaging checks distribution boundaries and retained notices before creating a `.deb` under the established `/var/www/mos-plugins/desktop` convention. It refuses unexpected assets and candidate overwrites. The compiled interface excludes test-only fixture bindings. Timestamps/permissions are normalized. Third-party notices are in `runtime/THIRD-PARTY-NOTICES.txt` and the package; compiled distribution approval does not grant a public license to private SDK source.

The MOS federation exposure is `./Plugin`, using host Vue only. The WASM URL is relative to the built plugin module, not the current MOS route. Navigation disposal ignores late bootstrap results and aborts pending asset fetches. The canary invokes one product-owned create-workspace command through the SDK wrapper/generated DTOs and displays revision/workspace/app/window counts; it does not create a second reducer or state store. No fixture data is imported.

## Next gates and rollback

After user-controlled MOS Hub installation, open the plugin page. Expected text: `Runtime PASS — revision 1; workspaces 1; apps 0; windows 0`. Navigate away and return without errors. This canary has no dashboard widget or configuration settings; the Hub settings/page action opens the canary.

This is a private homelab application using temporary public Hub distribution, not a long-term public SDK project. Installed operation uses local assets without retrieving SDK source or GitHub build inputs. Making the repository private later may break anonymous discovery, updates and reinstalls even if installed assets continue working. Private/local Hub support remains unverified.

M1 shell work waits for M0. M3 owns persistent Home/admission; M4 owns real Selkies integration; SDK fixtures do not waive those gates. Standalone access must authenticate independently and enforce equivalent authorization. Simultaneous input policy must be selected before two-view streaming acceptance.

Use MOS's normal plugin removal controls for rollback. There is no backend service or persistent application data to migrate; do not change unrelated plugins or restart services.

Numeric `0.1.0` tag builds through GitHub Actions and publishes a complete draft-then-public release with an architecture-independent `all` Debian package, MD5/SHA-256 sidecars and tagged source archive. Main/PR builds do not publish; never replace published version bytes. MOS Hub owns discovery only.
