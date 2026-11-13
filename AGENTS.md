# MOS Desktop — historical pre-DOX checkpoint

The Project Catalog below supersedes historical version, target and publication authorization statements in this opening checkpoint. Current authorization permits accepted source commits/pushes only; no release, install or deployment without separate approval. The permanent mos-desktop LXC is not disposable.

- Purpose: MOS-first desktop with embedded and standalone authenticated presentation of one application; Battlemoon remains the reusable SDK.
- Owns: Plugin/application source here; mos-hub owns discovery only. Private SDK source is not public repository content.
- Inputs: MOS Desktop Build Pack 0.1.2 and selected streaming-first SDK updates. Preserve M0 → M1 → M2 → M3 → M4 → selected M5 prerequisites.
- Current scope: user approved M2 continuation and standing future MOS Hub publications, including scoped source commits/pushes, numeric releases and catalog updates after verification. testit is the explicitly authorized disposable LXC for control tests and needed tool installation; leave code and all unrelated workloads untouched. Plugin installation remains user-controlled. Compiled WASM/minimum wrappers/generated DTOs/bindings/static assets are approved; raw SDK source, fixtures, internal records, caches, secrets and source maps remain excluded.
- Delivery posture: Private homelab application; public visibility is a temporary Hub distribution constraint, not a public-platform goal. Installed operation must not fetch SDK source or remote build inputs. Do not introduce community/publication infrastructure or change repository visibility without approval.
- Current checkpoint: M0/M1 and bounded M2 accepted. Published 0.2.2 retargets confirmed controls to renamed mos-desktop; installed update acceptance is open. M3 partial: preserved matt UID/GID 1001 and Home, verified runtime idmaps 0:200000:65536 and translated ownership 201001, removed broad pool/FUSE/GPU access, retained required TUN, verified cgroup limits, required-Home startup refusal, restart and sample restore. No personal backend services/admission yet. Autostart remains off pending recovery gates. Tailscale DNS renamed automatically; existing testit SSH alias is stale and new-host key verification remains human work. VALIDATION.md owns detailed evidence and protected recovery paths. Layout persistence remains verified-profile/Web-Locks and origin-local.
- Authority: MOS owns authentication, resource operations and installation. Closing a frontend must not terminate applications. User approved repurposing and renaming testit to mos-desktop, retaining ordinary user matt and binding only dedicated persistent Home. Only this backend may be controlled; code and unrelated workloads remain excluded. M2 bounded controls and safety checks pass; optional Binary Manager integration is deferred. M3 is partial: container isolation/Home provisioning verified, but no authenticated personal file/terminal service or backend admission yet.
- Verification: `node scripts/prepare-components.mjs`, then `cd page; npm ci --ignore-scripts; npm run prepare:runtime; npm run build; npm test; npm run check:built`. `runtime/` owns approved compiled interface/notices/provenance; no SDK credentials needed. Private SDK regeneration/pruning/equivalence scripts remain local. Internal AGENTS/DOX/VALIDATION remain intentionally untracked. Every delivery must reconcile a new immutable version, public allowlist and notices; never overwrite published assets. Current selected plugin version is 0.2.2; shared component versions/artifacts remain unchanged.
- Routes: `page/AGENTS.md` — owns M1 shell, component hosting and frontend verification; read when changing desktop interaction, configuration or layout storage. Other paths remain root-owned.
- Routes: `tests/e2e/AGENTS.md` — owns isolated installed-MOS Playwright authentication/UI regressions; read when changing browser automation or credential handling.
- Browser verification: root `npm test` preserves the page Node suite; `npm run test:e2e` runs isolated Chromium checks against the installed plugin. Root `.env.test`, `.playwright/`, CLI output and browser artifacts remain private and ignored. Use automated UI proof for routine changes; do not repeat human verification unnecessarily. No personal browser or backend resource mutations in layout tests; implementation order and SDK acceptance gates remain unchanged.


# DOX Harness

A self-routing repository harness for long-running agent work. A fresh agent must be able to continue from the repository, the applicable `AGENTS.md` chain, Git, and `DOX_CHANGELOG.md` without prior chat.

Everything above `## Project Catalog` is the framework rail. Change it only when the current user request explicitly makes DOX or harness behavior the subject of the work. The catalog and child `AGENTS.md` files are live project state.

## Managed Surface

DOX may maintain only root or scoped `AGENTS.md` files and one root `DOX_CHANGELOG.md`. Do not generate task, status, plan, memory, receipt, manifest, handoff, initialization, or hidden-state files for DOX. Normal project files and documentation remain allowed when the requested product work requires them.

## Sources of Truth

- The current user request owns the intended outcome.
- Code, configuration, schemas, tests, and observed runtime behavior own what exists.
- The root Project Catalog owns current project direction; the nearest applicable `AGENTS.md` owns local contracts and routes.
- Git status, diff, and history own change evidence when available.
- `DOX_CHANGELOG.md` owns concise chronological handoff history, not current state.
- Resolve conflicts from evidence and update the stale owner instead of duplicating truth.
- Chat history, hidden memory, and prior agent claims are non-canonical until confirmed by repository evidence.

## Verified State

Context may contain plans, assumptions, agent reports, and failed attempts. Durable factual claims about implementation or completion require repository or runtime evidence. Intended direction, constraints, preferences, and non-goals may also come from explicit user direction.

- Treat implementation work as provisional until proportionate verification confirms the relevant acceptance condition.
- Promote only verified implementation outcomes into the Project Catalog, applicable `AGENTS.md`, and completion claims.
- Preserve explicitly directed goals, contracts, preferences, and non-goals while clearly distinguishing them from verified implementation state.
- Preserve previously verified progress when later work fails; record the failure without weakening established facts.
- For risky or cross-boundary work, separate execution from the fresh evaluator pass already required by the Operating Loop.

## Start Every Task

Scale these steps to task scope. Trivial low-risk edits need only the relevant subset.

1. Read this file, inspect Git status and relevant history, and preserve pre-existing changes.
2. Read the latest three `DOX_CHANGELOG.md` entries when present; search older entries only when relevant.
3. Define the goal, done conditions, direct paths, and affected producers, consumers, interfaces, tests, and tooling.
4. Walk from the repository root to every direct or affected path and read each `AGENTS.md` on the route.
5. Inspect the current implementation and the cheapest relevant baseline check before editing when practical.
6. Repair only catalog, route, or contract drift needed for this task, then continue. No separate initialization pass or marker is required.

Pre-existing worktree changes are user-owned. Do not discard, reset, overwrite, or claim them. Integrate deliberately into already-modified files, keep unrelated edits out of scope, distinguish session work from earlier changes, and report uncertain ownership rather than guessing.

Load context by relevance, not by volume. Resolve safe ambiguity from repository evidence; ask only when an unresolved choice materially changes behavior, risk, or destructive scope.

## Operating Loop

Use `Orient -> Plan -> Build -> Verify -> Review -> Reconcile -> Record` as an outcome loop, not a required reporting format or set of artifacts.

- Work depth-first on the smallest coherent slice that satisfies a real acceptance condition.
- For a new app, establish a runnable end-to-end vertical slice first. Each later slice must preserve working flows and add a usable capability or measurable friction reduction.
- Keep lightweight plans in-session. Create project planning documents only when the task itself requires them.
- Do not hide missing behavior behind stubs, placeholders, mocked success, or unchecked assumptions.
- Leave the repository coherent and usable after each slice. Bound research, migration, and validation-only work explicitly.
- For risky, cross-boundary, or architecturally meaningful work, treat the build result as provisional until a fresh evaluator pass checks the request, applicable contracts, chosen complexity level, diff, and running behavior. For ordinary changes, a focused final review is sufficient.
- Apply the Control Rules proportionally. Use an independent reviewer or subagent only when the risk justifies it; otherwise review from a clean mental pass.

## Engineering Posture

Match engineering depth to the requested outcome, known users and environment, consequence of failure, and current project phase. Unless the request or repository contract says otherwise, optimize for practical personal-production software in a known homelab environment rather than an imagined future platform.

Default to the smallest complete, maintainable implementation that:

- makes the primary workflow work end to end;
- preserves unaffected existing behavior;
- handles likely failures and obvious edge cases;
- adds focused verification for changed behavior;
- follows existing project patterns;
- keeps future extension possible when inexpensive.

Do not add complexity for hypothetical maturity. Unless required by the current request, repository contract, existing architecture, or an observed problem, avoid:

- speculative abstractions and generalized frameworks;
- support for hypothetical users, unused platforms, hardware, or deployment environments;
- migrations or compatibility for versions and schemas that never shipped;
- exhaustive recovery, diagnostics, telemetry, or evidence systems;
- broad plugin, provider, extension, or public API surfaces;
- certification-style acceptance matrices;
- repeated manual UI proof when focused checks and one smoke test are sufficient;
- implementing later-phase architecture during an earlier phase.

A **usable implementation** is complete for its intended users and environment, maintainable, verified in its primary workflow, and safe in proportion to actual risk.

**Hardening** includes additional resilience, compatibility, observability, migrations, recovery tooling, exhaustive edge-case coverage, and platform generalization.

Deliver the usable implementation first. Add hardening only when it is:

- explicitly requested;
- required by an existing contract;
- justified by an observed problem; or
- clearly inexpensive and directly beneficial to the current workflow.

Treat other hardening and platform expansion as future work rather than silently expanding the current task.

Keep verification proportional:

- Prefer automated terminal-based checks.
- Use manual interaction only where behavior cannot be meaningfully verified otherwise.
- One focused smoke test is normally sufficient for native visual behavior.
- Do not repeatedly retry fragile coordinate-based UI actions merely to satisfy a procedural gate.
- Do not classify a working feature as failed solely because optional hardening or exhaustive manual proof remains incomplete.

When estimating or reporting remaining work, separate:

- work required for the requested usable result;
- optional production hardening;
- deferred product capabilities;
- later product phases or platform ambitions.

## Delivery Tiers

Unless the user or repository contract says otherwise, the active target is **Tier 1 — Homelab Sufficient** for known users in the documented environment.

### Tier 1 — Homelab Sufficient

Tier 1 is the smallest complete, maintainable result suitable for personal use. It must preserve real security, privilege, destructive-operation, network, and data-integrity boundaries, but it does not need public-production machinery for hypothetical users or deployments.

Every project should identify a clear **Homelab Completion Point**. At that point, the current product is complete for personal use in its documented environment and work may stop unless requirements or deployment assumptions change.

### Tier 2 — Production Readiness

Tier 2 is optional unless broader deployment is explicitly requested or already required by the repository contract. It contains only product-specific production hardening such as untrusted-user security, broader compatibility, shipped-version migrations, recovery and operations, public distribution, or stable external contracts.

Do not use a generic enterprise checklist. Keep Tier 2 separate from deferred features and later platform ambitions. Only current-target work belongs in active milestones, acceptance gates, and the default estimate.

## Complexity Ladder

Use the lowest level that fully satisfies current requirements:

`extend existing code -> small helper/direct API -> extend existing module -> local abstraction -> shared subsystem -> framework/platform`

Stop at the first clean fit. Move higher only for multiple concrete current uses, an explicit repository contract, an established project pattern, or demonstrated inadequacy of the simpler level. Prefer fewer concepts, files, and public surfaces; do not add managers, services, registries, providers, pipelines, or frameworks when an earlier level works. Every abstraction must remove more complexity than it adds; a simpler proven reference is preferred unless a concrete requirement justifies more structure.

## Work Ladder

The Complexity Ladder controls how much structure one item needs; the Work Ladder controls how far to progress through a multi-item work set. Use the normal Operating Loop for one bounded change. Activate the Work Ladder when a request or adopted Markdown board contains multiple coherent milestones, lightweight dependencies, a long/autonomous run, or independent work that can continue around blockers. The user does not need to name it explicitly.

- Establish ordering and only the dependencies needed to choose safe next work. Keep WIP to the current item and run the Operating Loop to a real resolution boundary before starting another.
- Resolve each item as `completed`, `partial`, `blocked`, `unavailable`, or `skipped/deferred`. Preserve every verified subset and never lower the proof bar to manufacture progress.
- Classify blockers by scope: local -> record it and continue independent items; dependency -> defer only dependent items and continue independent items; global -> stop and preserve all verified progress.
- Continue without a user round trip while an actionable in-scope item remains. Continue through blockers, not invalid assumptions.
- Default to sequential context: load the current item, current repository evidence, and applicable routed `AGENTS.md` chain; do not load future task bodies beyond minimal ordering or dependency metadata. Use preflight-then-sequential when shared architecture or dependencies must be understood before implementation.
- When the user or project explicitly adopts a Markdown work board such as `todo/`, `working/`, `blocked/`, and `done/`, treat its task files as requested project artifacts rather than hidden DOX state. Ordinary Markdown, filename order, or minimal `depends_on` metadata is sufficient. Reconcile stale task assumptions before execution, update task state as items resolve, and do not create a board for ordinary tasks or build a workflow engine.
- For substantial ladder runs, after no actionable item remains, perform a fresh consistency/freeze review across materially relevant representations of the same state, such as source, interfaces, runtime capabilities, tests, live or smoke evidence, docs, manifests, schemas, baselines, board state, the Project Catalog, and applicable contracts. This pass normally adds no features; resolve meaningful drift or record it explicitly.
- Record a bounded final state so a future agent can identify completed work, verified partial or unavailable subsets, blockers, dependency-skipped work, remaining actionable work, and the next item without the original chat.

### Durable Ladder Checkpoints

For substantial or multi-session Work Ladder runs, maintain a recoverable execution checkpoint **within existing DOX owners**, not a new ledger, status, or handoff file. The root Project Catalog owns the *current* checkpoint and next actionable slice; applicable child `AGENTS.md` files own durable local contracts; `DOX_CHANGELOG.md` records chronological, evidence-backed transitions. If the user explicitly adopts a Markdown work board, update that requested project artifact as described above rather than creating a parallel DOX ledger.

- At the outset, recover the ordered in-scope items, minimum dependency edges, acceptance conditions, and existing verified results from the request, repository evidence, and applicable contracts. Keep detailed task bodies in-session or in an explicitly adopted board; keep the root snapshot compact.
- Before each new rung, reconcile the Project Catalog's `Current checkpoint`, `Next slice`, and `Gaps / blockers` with observed state. Preserve verified subsets and name the earliest actionable item; do not imply unverified work is done.
- At meaningful transitions (verified completion, partial progress, newly blocked or unblocked work, phase change, and before handoff/context compaction), refresh the current snapshot. Record actual checks and results in the appropriate existing owner; append chronological history at the normal session boundary, not after every micro-step.
- For a blocker, capture its scope (local, dependency, or global), evidence, attempted remedies, affected dependents, and precise unblocking condition, concisely in the current snapshot or an adopted board. Continue with the earliest independent actionable item; revisit blockers only when new evidence changes their prospects.
- At resume, read the normal DOX entry points and reconstruct the ladder from current repository evidence. Never trust a stale checkpoint over code, tests, runtime, or Git; reconcile conflicts in place instead of duplicating state.
- Stop only when the requested work is verified complete or no authorized, independent, in-scope work remains actionable. Perform the Work Ladder consistency review and leave a concise final checkpoint that distinguishes verified completion, partial work, blocked/dependency-skipped work, and the next human decision or action.

Do not turn checkpointing into a workflow engine, exhaustive task matrix, or mandatory new artifact. Scale updates to meaningful state changes and preserve the Managed Surface rule.

## Control Rules

- **Cue:** express condition-dependent guidance as `When <trigger> -> <action>`.
- **Reconcile:** derive actual state anew; repeated runs must converge without duplicate artifacts, entries, or side effects.
- **Focus:** keep work in progress to one coherent slice; complete, block, or defer it before starting another.
- **Prove:** establish `baseline -> invariant -> intended delta -> proof`; test the cheapest assumption that could invalidate the plan first.
- **Close:** follow materially affected owners, producers, consumers, references, interfaces, schemas, tests, and tooling until each relevant edge is updated or shown unaffected.
- **Canary:** before broad, destructive, or hard-to-reverse work, prove one representative case and identify recovery.
- **Break loops:** after two similar failures under one hypothesis, stop retrying, minimize the case, gather new evidence, and form a new hypothesis.
- **Falsify:** during review, seek the cheapest meaningful counterexample, regression, or simpler sufficient design.
- **Enforce:** prefer the strongest inexpensive layer: type/schema/config -> automated check -> point-of-use contract -> changelog.
- **Subtract:** after proof, remove task-introduced structure and demonstrably obsolete duplication or compatibility paths that are not required by the final result.

## Contract Reconciliation

Keep one canonical owner for each durable truth. Child contracts own durable local expectations; the Project Catalog owns current direction and completion state; `DOX_CHANGELOG.md` owns history.

Update an `AGENTS.md` only when a future agent needs to understand or behave differently because of the change. Internal implementation edits that preserve durable expectations do not require contract updates.

Do not duplicate stable architecture, ownership, interfaces, or operating rules in the Project Catalog. Link to the owning contract and record only the catalog implications.

When validating or reporting work, distinguish direct checks and observations from inference. Report skipped checks and meaningful unverified areas explicitly.

- Do not promote task-agent narration, plans, or inferred success into durable contracts or catalog state; promote only facts established by direct checks or observations.

## Validation and Completion

- Completion is a repository-state decision, not an agent self-report. Accept it only when the requested outcome, relevant integrity boundaries, and applicable contracts are all supported by proportionate evidence.
- Verification guidance in `AGENTS.md` is not evidence that it ran.
- Prefer behavior-level checks; for user-facing work, exercise the changed workflow as a user when tools permit.
- Without an exact oracle, test invariants, input/output relationships, or trusted reference behavior; never accept plausibility alone.
- Record actual commands or manual checks and classify results as `passed`, `failed`, `partial`, `skipped`, `blocked`, or `not run`.
- Never claim completion while current-target capabilities remain stubbed, failing, or meaningfully unverified.
- Do not withhold completion solely because optional production hardening, exhaustive proof, deferred features, or later-platform work remains.
- State uncertainty and unverified scope directly.
- Before closeout, inspect the final diff for unintended files, regressions, duplicated logic, stale comments, and scope drift.

## Local Routing

Routing is both contract specialization and context localization. Keep the always-read root project layer thin: the framework rail, truly repository-wide state, decisions, and commands, a compact catalog, and semantic direct-child routes. Put detailed subsystem architecture, interfaces, commands, workflows, conventions, verification, and deeper routes in the nearest durable child so unrelated work does not load them.

Create or retain a child `AGENTS.md` for a durable work boundary when agents will repeatedly work there and local context would improve correctness or reduce unrelated root context. Strong signals include:

- a major source, runtime, CLI, UI, data, documentation, test, script, packaging, migration, or operations boundary;
- an independently built, tested, packaged, or deployed component;
- a distinct language, toolchain, interface, dataflow, security or reliability contract, workflow, quality standard, command set, or verification path;
- a subtree large or active enough that direct routing materially improves context acquisition.

Do not require exceptional rules or unique ownership. Do not create sidecars for generated output, dependencies, caches, temporary directories, one-purpose leaf folders, or boundaries whose useful context is identical to their parent.

### Route Census

On the first meaningful repository task after bootstrap, and when repository structure materially changes, inspect durable top-level and major second-level work boundaries. For each boundary ask:

1. Will agents repeatedly work here?
2. Is there durable local context future work should not rediscover or load globally?
3. Would a route improve narrow-task routing or the one-level whole-project snapshot?

If yes, create or retain a scoped `AGENTS.md`, register it in its direct parent, and seed it with enough evidence-backed local context to orient future work. Do not create placeholder-only sidecars. This is a bounded topology and context pass, not a requirement to document every directory; deepen contracts lazily as real work reveals durable facts.

Every child `AGENTS.md` must appear in its direct parent’s `Routes`; unlisted paths remain owned by the nearest applicable parent. Each parent lists only direct children and explains their semantic scope and read trigger.

The nearest file specializes its parent but cannot weaken the framework or explicit parent invariants. Actual sidecars found on disk apply even when a parent route index is stale; repair the index in the same task.

For narrow work, read the root and only the applicable route chains. For a whole-project architectural snapshot, read the root and all direct top-level child contracts, then descend only where more detail is needed.

Use this as a minimum child shape, not a size limit. Expand it with headings and subsections when the boundary has durable local knowledge; concise means current and correctly scoped, not artificially short.

```markdown
# <Boundary>

- Purpose: <why it exists>
- Read when: <changes or questions that require this contract>
- Owns: <paths, state, APIs, or canonical sources>
- Inputs / dependencies: <upstream contracts>
- Outputs / consumers: <downstream contracts and side effects>
- Invariants / decisions: <rules, rationale, and evidence or condition that should reopen them>
- Work guidance: <local architecture, structure, commands, conventions, workflows, and quality rules>
- Verification: <existing checks>
- Routes: <direct child AGENTS.md paths, scopes, and read-when triggers, or None>
```

Write routes as cues: `<path> — owns <scope>; read when <trigger>`.

When durable information applies primarily to one subtree but appears at root, move it to the nearest owning child and leave only the route cue or repository-wide consequence at root. When repeated work crosses a parent boundary to rediscover the same local knowledge, promote that knowledge into a child. When a child no longer contains meaningfully distinct context, collapse it only after preserving still-valid unique rules in the correct owner.

Update the nearest owner when purpose, ownership, interfaces, dataflow, invariants, durable decisions or preferences, commands, or routes change. Move a sidecar with its boundary; remove it only after preserving still-valid unique rules. Do not delete human-authored instructions merely to normalize routing or document shape. Keep current contracts, not task history.

## Project Catalog Rules

Maintain **Project Catalog** from explicit user direction and repository evidence.

- Keep it a compact operational snapshot, not a whole-application architecture guide; history belongs in `DOX_CHANGELOG.md`.
- Root should know that a subsystem exists, why it matters globally, and where its contract lives. How that subsystem works belongs in its routed child unless the fact truly constrains the entire repository.
- Unless the user or repository contract says otherwise, set the current delivery target to personal homelab use by known users in a documented environment.
- `Completion map` lists major user-observable workflows required for the current delivery target, not implementation subtasks.
- Production hardening, deferred capabilities, and later platform ambitions remain separate and do not prevent the current delivery target from being complete.
- `Current checkpoint` states what is demonstrably usable now. Mark a capability `done` only after behavior-level evidence; never weaken or remove it merely to manufacture completion.
- `Homelab completion point` states the smallest complete, maintainable state suitable for personal use in the documented environment.
- `Next slice` is the single highest-value coherent outcome ready to execute. The active user request supersedes it; update it only during reconciliation.
- Record only meaningful gaps, truly repository-wide invariants and commands, and direct child routes. Route subtree-specific detail to the nearest owning child.
- Populate unknown product fields lazily during the first relevant task. Repository topology is the exception: perform the Route Census during the first meaningful task after bootstrap. Do not invent facts to fill placeholders.

## Orchestration Changelog

At the end of every meaningful session, create or append one entry to root `DOX_CHANGELOG.md`.

Skip:

- trivial read-only orientation with no durable finding;
- typo or spelling fixes;
- insignificant formatting;
- whitespace-only cleanup;
- similarly negligible work.

- Re-read the tail immediately before appending; never rewrite, reorder, or delete old entries.
- Use UTC time and repository-relative paths. Include every path touched by this session, including DOX files.
- Keep the entry factually equivalent to the user-facing wrap-up.
- The changelog is history, not current truth. Correct an old error with a new entry.
- Appending the changelog is the final intentional write. Re-read the entry and inspect status once more before responding.

```markdown
## <UTC timestamp> — <task>

- Request: <concise task objective>
- Result: <completed, partial, blocked, or no-change — concise factual outcome>
- Files:
  - Created: <paths, or None>
  - Modified: <paths, or None>
  - Moved/Renamed: <old/path -> new/path, or None>
  - Deleted: <paths, or None>
- Validation: <state — checks actually run, scope, and result>
- DOX: <catalog, contracts, or routes updated; or reviewed with no change>
- Remaining: <unfinished requested work, or None>
- Next: <one next step, blocker, or None>
```

Use one repository-relative path per line when a category contains multiple paths. Do not include raw command output, full diffs, copied prompts or chat transcripts, secrets, or credentials. If the append fails, report the failure and do not claim success.

## Project Catalog

### Product

- Mission: One authenticated MOS-first desktop application with host-owned sessions, scoped personal files, terminal and streamed applications; Battlemoon supplies reusable mechanics.
- Users: Known personal users by default; replace only from explicit direction or repository evidence.
- Current delivery target: Tier 1 — Homelab Sufficient, unless explicitly overridden.
- Homelab completion point: Embedded and authenticated standalone access to the same scoped personal workspace, files, terminal, approved streaming and editor Open/Save, with recovery and isolation verified.
- Completion map: `done` supported L1–L4/layouts, Tier1 nested Home/moves/trash, Terminal, shared editor Open/Save and standalone on both approved MOS hosts; `done` NVIDIA/NVENC and AMD/VA-API Wayland streams with roles/recovery and owner-confirmed smoother feel; `done` original-host Home backup/isolated restore and host reboot/manual container recovery; `done` AMD automatic full host reboot recovery. Separate Battle native-editor input remains human verification required, not a MOS Tier1 blocker. Landlock/JWT revocation remain optional hardening.
- Non-goals: Unrelated Battle milestones, new application/window managers and implicit deployment. The separately authorized local shell integration is described in SHELL-INTEGRATION.md.

### Current State

- Live design: owner-approved frontend0.2.15 is installed persistently on MOS and AOS, with host-specific root-only frontend backups and retained0.2.14 rollback. DESIGN-INTEGRATION.md owns exact hash/recovery and live embedded/standalone design evidence. Both live presentations pass scoped styles, actual host colors, Library/editor/Clock and retained draft checks; installed layout/auth9 per host passes (two opt-in stream checks skipped). No backend/connector grants, service restart, reboot or public release. SDK0.4.0 unchanged; public packaging remains guarded.

- Registry/connectors candidate: authorized uncommitted SDK/MOS source adds the early ordinary catalog, shared Start/application projection, trusted/web/single-session Selkies/text adapters, bounded Home data discovery and opt-in exact-artifact approval/activation. Local real-browser and file-backed host proofs are separate from installed0.2.14 acceptance. `APPLICATION-CATALOG.md` owns behavior/limits. Packaging is disabled pending an approved new version; no deployment, live root/permission change or release occurred. Bounded Battle native browser controls now pass supported local Windows/no-MCP proof under an explicit existing-style React exception; full Linux scratch service suite now passes with user-provisioned aiohttp (30 passed, one optional Landlock skip); catalog policy/capacity repairs and native close-reset proof also pass. E6/E10/installed E12 need exact host/candidate/backup approval; E7 independent sessions stay deferred.

- Current checkpoint: Both installed0.2.15 frontend deployments provide the live SDK design and accepted local shell composition, with basic installed layout/auth/design workflow proof. Existing scoped personal services, GPU configuration and identities remain unchanged; their prior0.2.14 acceptance is retained rather than restated as new0.2.15 full personal/stream or reboot acceptance. No public release or unrelated workload changes.
- Verification: After AMD reboot, boundary/source/storage checks passed but initial browser9/11 exposed missing web routes. Persistent hook repaired; browser11, both personal presentations/480-key input and nested UI now pass. Isolated startup regression covers recreated nginx config with existing backup and repeated calls. Earlier Node37/backend25 (one optional skip), original-host layout/auth9 and scoped lifecycle proofs remain valid. Documentation2aad86e is pushed; CI38348049125 passes Linux backend/build with release skipped. Subsequent owner reboot verified automatic hook execution without intervention; browser11, both personal presentations/480-key input, nested UI and boundary/source/storage checks pass.
- Persistence: Owner AMD reboot automatically recovered container, all five services, bridge process, Tailscale identity and unchanged Home canary. Web routes did not recover: persistent backup existence incorrectly aborted the hook. Fixed without restarting native services; actual regenerated-config restoration, repeated invocation and isolated regression pass, preserving the original backup. Browser11 passes after repair. Subsequent owner reboot recovered both web routes automatically with no starts/restarts/repairs; full AMD automatic recovery is verified. Original host reboot/manual recovery and separate Home backup remain verified; both owner-set autostart1 flags preserved. backend/AGENTS.md owns exact boundaries.
- Research: `backend/MOS-INTEGRATION-REFERENCE.md` owns reusable MOS frontend/API/backend traces and deployment quirks. Native root-admin file tools are not personal scope; JWT revocation and stronger containment remain optional hardening under the approved Tier1 contract.
- Backup: Public source remains mfleming1290/mos-desktop; private source/DOX/research and credential-free startup hook backup is mfleming1290/mos-desktop-private. Secrets/auth state and personal files are excluded. Updated SDK0.2.0 ZIP/guides are released privately in mfleming1290/battlemoon-desktop; historical0.1.0 retained.
- Gaps / blockers: Owner reports both AMD/NVIDIA feel much smoother; this is human qualitative confirmation, not measured latency/FPS or exhaustive media acceptance. Battle-native acceptance remains open; audio disabled. Concurrent native reparent and optimistic Save races remain disclosed Tier1 limits. No second-host backup destination was invented. Unrelated Battle Widget changes remain preserved, not accepted by this run.
- Next slice: Owner visually review live design on either MOS host. Installed E6/E10/executable E12 still require a separate bounded backend/roots/approval scope; this frontend-only deployment does not grant it. SDK0.4.0 is unchanged; retained0.2.14 is rollback. Battle native shell UI/E7 remain deferred.

### Future Scope

- Production hardening: None required for the current target unless evidence says otherwise.
- Deferred capabilities: Live deployment of the accepted local shell integration requires separate approval. Battle native shell UI remains deferred.
- Later platform ambitions: None recorded.

### Global Contracts / Decisions

- Default to personal use by known users in a documented homelab environment unless explicitly overridden.
- Deliver Tier 1 before optional Tier 2 work.
- Accepted source commits/pushes, scoped personal services/frontend updates and Selkies installation are authorized. Nested operations may use only the existing approved personal Home under existing LXC matt permissions; no permanent deletion/purge, extra mounts or identity changes. Release/publication remains approval-gated. Earlier version and disposable-container statements above are historical, not current authority.

### Run and Verify

- `npm test` — existing page Node suite; `npm run test:e2e` — isolated installed-MOS UI suite. Credentials and reusable auth remain private and ignored.

### Routes

- `page/AGENTS.md` — owns shell presentation and persistence; read when changing frontend behavior.
- `tests/AGENTS.md` — owns regression boundaries; read when adding or changing tests.
- `backend/AGENTS.md` — owns scoped services and recovery; read when changing admission, files, PTYs or deployment inputs.
- Packaging scripts and approved compiled runtime remain root-owned; read the root distribution constraints before changing them. Generated artifacts do not need sidecars.
