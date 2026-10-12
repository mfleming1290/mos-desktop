# Isolated MOS browser checks

Run from the repository root:

```powershell
rtk proxy npm test
rtk proxy npm run test:e2e
```

The first preserves the Node suite in page/. The second launches a dedicated headless Chromium context, logs in through the UI, saves private reusable authentication state, then runs the UI/isolation scenarios in fresh contexts. It tests the **installed plugin**, not an uninstalled local source change. New product candidates still require separately approved installation before these results establish their behavior.

Private root `.env.test` supplies `MOS_TEST_URL`, `MOS_TEST_USERNAME`, `MOS_TEST_PASSWORD`. Never paste its values into commands, reports or chat. Environment loading happens in Node. HTTPS/localhost is required; TLS verification remains enabled. No credential or state files belong in Git or a distribution archive. Saved auth state can impersonate the test account: keep local, revoke temporary credentials when finished and remove its saved state when no longer needed.

Commands:

- `npm run test:e2e:auth`: refresh `.playwright/.auth/mos-test.json` using isolated UI login.
- `npm run test:e2e:list`: list checks without running browser actions.
- `npm run test:e2e -- --grep "mouse resize"`: focused scenario (authentication dependency still runs).
- `npm run test:e2e -- --project=chromium --no-deps`: reuse existing auth state; if expired, refresh through auth command rather than weakening access checks.

Coverage: real mouse move/resize/release and Escape cancellation; dock preview/apply; tab/taskbar activation and applied Clock configuration; keyboard move/focus/minimize/close; freeform restoration; minimized state; full page refresh recovery. Unfinished edits are checked across arrangement changes, not promised to persist across reload before Apply.

Owner streaming integration is opt-in: set MOS_TEST_ACCOUNT=matt and
MOS_STREAM_TEST=1, then run `npx playwright test tests/e2e/stream.spec.cjs`.
It uses real streamed mouse/keyboard input, native Save, viewer denial, takeover,
network interruption and refresh/relaunch. Existing root@mos SSH performs only
read-only canary/PID assertions. It retains unique Home canaries, never restarts
services or ends PTYs. Default non-owner layout runs skip this separate check.
Native typing uses20ms between keys and150ms after remote editing shortcuts;
this is functional interaction acceptance, not maximum-rate input benchmarking.

All layout-test contexts block non-read `/api/` requests; no MOS resource controls are exercised. Storage is isolated browser-local, so closing test windows does not modify the human browser's layout. No internal application function, reducer or localStorage writes bypass the UI. Geometry assertions read DOM rectangles in workspace coordinates, not scroll-sensitive screen coordinates.

## Playwright CLI debugging

Read the installed Playwright skill from the Codex skill catalog before interactive debugging. Use an available CLI and a unique named session; never attach to a personal browser or call close-all/kill-all.

```powershell
rtk proxy playwright-cli -s=mos-layout-automation open about:blank
rtk proxy playwright-cli -s=mos-layout-automation state-load .playwright/.auth/mos-test.json
```

Navigate that isolated session to the private configured MOS dashboard/plugin URL, snapshot, then use fresh refs for clicks/keyboard. Do not dump cookies/storage/network headers or trace authenticated login. CLI artifacts may contain private data and remain ignored. Finish:

```powershell
rtk proxy playwright-cli -s=mos-layout-automation close
```

Playwright handles routine verifications; terminal-browser remains available for bounded diagnostics under its own skill. Neither replaces genuinely native OS, physical multi-monitor or independently required SDK acceptance checks. Do not repeatedly request human proof of an interaction that the real browser suite already covers.
