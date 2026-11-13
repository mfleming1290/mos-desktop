# MOS Desktop regression tests

- Purpose: Preserve existing reducer, host, compiled-boundary and installed-browser regression coverage.
- Read when: Adding or changing tests or verification commands.
- Owns: Node tests in this directory; browser checks specialize this contract below.
- Inputs / dependencies: Parent security/distribution boundaries, page implementation and approved compiled runtime.
- Outputs / consumers: Root npm test forwards the existing page Node suite; npm run test:e2e runs installed-MOS checks independently.
- Invariants: Do not replace real boundary acceptance with mocks. Node/JSDOM checks support, but do not establish, installed browser or native OS behavior. Credentials, session state and artifacts remain ignored; do not mutate unrelated workloads.
- Verification: npm test; npm run test:e2e for browser changes; compiled public-boundary checks for runtime/distribution changes.
- Personal verification: npm run test:personal-ui owns a loopback server and isolated browser with an explicit service fixture. Backend unittest exercises real Linux files, PTYs and TLS separately. editor-host-integration.mjs mounts the reviewed SDK CodeMirror DOM handle; no actual Battle native/MOS editor acceptance is implied. Never use fixtures to promote deployed service readiness.
- Installed personal verification: Set MOS_TEST_ACCOUNT=matt for dedicated owner authentication, then run node tests/personal-live.cjs; repeat with MOS_TEST_PRESENTATION=standalone. Actual Home/shared-editor controls verify Open/Save/Save As/reopen and cross-presentation conflicts;480 real key presses must arrive without losing control before terminal refresh/End. Unique canary files remain; only the created terminal is ended. No service restart or personal browser control. Backend tests separately assert shared authentication pacing and429/503 classification without weakening per-request verification.
- Routes: `e2e/AGENTS.md` — owns isolated authentication and actual UI regression; read when changing browser tests.
- Nested installed verification: `MOS_TEST_ACCOUNT=matt node tests/personal-nested-live.cjs` uses real Home controls for nested folders/write/move/trash/restore/refresh; retains only unique canary data. Ordinary MOS backend tests cover conflicts, permissions, symlink/traversal and interrupted trash. Landlock/native-reparent isolation is optional Tier1 hardening, not an acceptance prerequisite.
