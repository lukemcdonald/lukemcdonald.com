# Easter eggs

Small, removable visual extras. The runtime installs one document key listener and picks an egg at activation time. Toggled eggs stay on across ClientRouter navigations and reloads via `localStorage` (`easter-egg:<id>`), restored by an inline head script the same way theme is.

## Add an egg

1. Create `src/components/EasterEggs/eggs/<id>/`.
2. Export an `EasterEgg` from `egg.ts` (id, name, mode, trigger, optional duration, sounds, and hooks). Re-export it from `index.ts` without importing CSS so Node tests stay CSS-free.
3. Keep egg CSS in that folder as `*.css`, scoped to `html[data-easter-egg='<id>']`. `EasterEggs.astro` picks those files up automatically so restored eggs do not flash unstyled.
4. Register it in `registry.ts`.

Triggers are data. `sequence` (a list of `event.code` values) is implemented; other kinds can be added to `EasterEggTrigger` later.

`mode: 'toggle'` stays on until the same trigger is entered again, persists in `localStorage`, and ignores Escape. `mode: 'timed'` plays once, then fades; Escape dismisses timed eggs only.

Play `soundOn` when the user turns an egg on and `soundOff` when they turn it off (skipped for silent restore). Aurora uses cuelume `success` and `close`.

Respect `prefers-reduced-motion` in egg CSS: no drifting, a static or very subtle opacity glow only.

## Assign an egg

Edit `config.ts`:

- `strategy: 'static'` with `staticId` (current default: `aurora`)
- `strategy: 'random'` among eggs that just matched the trigger
- `strategy: 'schedule'` using each egg's optional `schedule` (month, season, or a date range that may wrap the year)

The picker runs in the browser when a trigger matches, so a deploy is not required to change the calendar day.

## Remove an egg

1. Delete its folder under `eggs/`.
2. Remove its import and array entry from `registry.ts`.
3. If `config.ts` still points at that id, pick another `staticId`.

Shared hooks such as `data-landscape` on the background image stay; only delete those if no remaining egg uses them.
