# Agent notes

Personal Astro site. Prefer small, reversible changes that keep desktop and phone behavior aligned.

## Commands

- `pnpm validate` — lint, format, `astro check`, and tests
- `pnpm dev` — http://localhost:3000
- `pnpm test` — `node:test`

## Navigation

Work, Play, and Live destinations come from `getNavigationGroups()` in `src/features/navigation`. Desktop dropdowns, the phone menu, Cmd+K, and homepage greeting links must use that helper. Do not call `getPublishedPages` from `src/components`.

## Interaction sounds

Cuelume hover is mouse-only. Links that can be tapped or focused must use `LINK_CUE_PROPS` (hover tick + click toggle), not `data-cuelume-hover` alone.

- Links: `LINK_CUE_PROPS` (or `SOFT_LINK_CUE_PROPS` for whisper)
- Switches and menu chrome: `TOGGLE_CUE_PROPS`
- Momentary buttons: `PRESS_CUE_PROPS`

Do not add a Sound row to the phone menu unless asked. Phone destinations still need tap cues so sound works when it is already enabled.

## Pointer split

Desktop nav and Cmd+K hydrate at `(hover: hover) and (pointer: fine)`. The phone menu is the coarse-pointer chrome. Keep those surfaces aligned; do not hide a control on one side without an equivalent.

## Conventions

- Conventional commits, no scope
- Object keys alphabetical
- Explicit `return` on its own line
- `pnpm validate` before done
