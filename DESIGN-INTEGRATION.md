# Optional design integration

The local source candidate uses the owner-supplied Universal Design Pack1.0.0
through three reviewed static CSS assets under `runtime/design/`. Hashes and the
selector namespace transform are recorded in its `identity.json`.

## Boundaries and differences

The SDK owns optional tokens/themes/guides and a presentation specimen. MOS owns
the existing Vue UI, authentication, commands, persistence, confirmation paths,
window focus and content lifetime. No Astryx or new component framework is added.
Original donor scripts and application source snapshots are not bundled.

The specimen adapts flat surfaces, teal action tints,8px controls,12px panels and
source-derived spacing. MOS supplies surface/on-surface variables; standalone
uses explicit dark fallback colors and a system font. Hover/disabled/selection
roles and essential input boundaries are authored bindings, not extracted claims.
Small text uses host foreground, not teal. Browser checks measure normal-text
contrast and essential input boundaries for the tested dark/light host pairs.

Library cards/search, connector controls, personal wrappers, window chrome,
toolbars and shell popup presentation share these styles. Editor content retains
its reviewed light surface; terminal and opaque web/stream contents remain under
their existing control. Styling grants no authority inside remote frames.

The workspace stays rectangular to preserve original corner context-menu hit
testing; panels are rounded. Positioned shell cells/compact chrome preserve
their existing dimensions while ordinary actions use44px minimum heights.
The decorative reserved-strip debug text was removed; its24px reservation and
accessible name remain unchanged.

## Verification observed for this candidate

- `node tests/design-ui.cjs`: real local Chromium, dark/light inherited host
  colors, no host style leakage, keyboard focus, Library search/no-results,
  retained editor draft/window identity, narrow390px and200% text, forced colors
  and reduced motion. Screenshots are private test artifacts.
- `node tests/shell-ui.cjs`: original shell actions/profile/CAS/recovery plus
  E11 fourth adapter and local E12 actual disk approval/activation/revocation pass.
- `node tests/personal-ui.cjs`: editor Open/Save/conflict and terminal typing,
  detach/reattach/explicit End and standalone authentication fixture proof pass.
- Both Vite builds and compiled asset-boundary checks pass.

These are local browser proofs with isolated authentication/service fixtures.
They are not installed MOS, hardware, native UI or comprehensive accessibility
acceptance. Installed0.2.14 and its services remain unchanged. A later deployment
still needs an exact host/version/hash, persistent backup and rollback approval.
