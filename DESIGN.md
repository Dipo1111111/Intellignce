# Design — HEAD UNIT

Replacement visual world for INTELLGNCE, built 2026-09-17. Replaces the
rejected dark neon-glass world entirely; nothing from it survives except the
routes and the product copy.

## World

A race-timing board and cycle-computer readout for a morning training ritual:
cool aluminum ground, ink type, one signal orange. Daylight scene, so the
ground is light. Color strategy: restrained — neutrals plus one accent
(timing orange `#e8490f`; small-text safe variant `#c23908`), with deep navy
`#0c2233` as a structural dark, not an accent.

## Type

- Display: Barlow Condensed (600/700, uppercase) — chosen because the world
  needs condensed large-scale split numerals; a text face cannot compress that
  density. Never body copy.
- Body/UI: Barlow (400–700).
- Data only: JetBrains Mono for times, doses, splits, measurements.

## Signature elements

- Giant split numerals (week/day, gain ranges) in condensed display type.
- Timing-tab navigation: hairline strip, active tab takes an orange underline.
- LAP snap: logging a block snaps the row with a single overshoot and holds —
  the one authored motion on the site.
- CUE PHASES: every day/task state is a named label (Live, Active, Logged,
  Rest, Pending) with text, never color alone.
- CORD SPINE: the gain curve is drawn as one continuous cord from first
  session to plan ceiling.
- PLATE LIGHT: all shadows share one offset/blur discipline; no ambient glows.
- Evidence pills on Science; timing lights (pulse-dot) mark live/system state.

## Raises kept from declined challengers (seed f0fa9a91)

- BLIND SNAP (depot blind): whole-step state changes with overshoot; error is
  the stalled half-state.
- LIVE MARK (phosphor terminal): today's live position is explicitly marked.
- PLATE LIGHT (precisionist plate): single light-source shadow discipline.
- CORD SPINE (drawcord cape): one traced line per run.
- CUE PHASES (cyclorama dawn): named phase labels, never color alone.
- Competitive alternate, not built: Japanese high-density module mosaic.

## Known detector finding (kept deliberately)

`bounce-easing` warning on the LAP snap overshoot: the overshoot is the named
signature motion of this world (BLIND SNAP raise), not decoration.
