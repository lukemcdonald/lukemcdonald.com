---
name: lukemcdonald.com
description: Rules for the existing personal-site UI. Token values live in CSS; restyle through current utilities and components.
---

Tokens live in `src/assets/styles/theme.css`, which is the source of truth; this file holds rules, not values.

## Overview

Personal site with a landscape-led home shell: tinted page chrome, a white desktop site card, a mid-tone hero with mountains, and a dark content panel. Overlays (nav menus, command palette) use the `glass` utility. Restyle through existing Tailwind theme utilities and CSS variables; do not add a parallel palette or type ramp.

## Themes and modes

Runtime attributes on `<html>` remap the same CSS variables. Do not invent a second token set.

- **Color** (`data-theme`: `default`, `blue`, `emerald`, `orange`, `purple`, `yellow`): rewrites `--color-primary-*` and `--color-secondary-base`. Default removes `data-theme` so `@theme` values apply. Use `bg-primary-*`, `text-primary-*`, `decoration-primary-500`.
- **Appearance** (`.dark` class on `<html>`): pick shades with `dark:`. Default mode is `system`. Home `.site` stays white; `ProseLayout` inverts.
- **Font** (`data-font`: Work, Play, Live from `src/components/Settings/Font/pairings.ts`): sets `--font-heading`, `--font-sans`, and `--font-ui`. Unset `data-font` is the default. Headings use `--font-heading`; `.site-header` and `footer` use `--font-ui`; `button`, `input`, `select`, `textarea`, and `kbd` inherit sans/UI, not the heading face.
- **Glass** (`data-glass`: `clear`, `tinted`, `solid`): changes `--glass-*` used by the `glass` utility. Default is tinted.

## Components

Reuse these; copy from the file instead of inventing variants.

- Type: `Heading`, `Text`, `Link`, `Prose`.
- Shell: `src/layouts/Main.astro` (home/page card), `src/layouts/ProseLayout.astro` (resume/long-form).
- Overlays and focus: `glass` / `glass-dialog` and `focus-ring` in `src/assets/styles/effects.css`.
- Command palette chrome: `src/components/CommandPalette/chrome.ts`.
- Forms: `MenuSelect`; keep control text on sans/UI.
- Native `<dialog>` for the palette and mobile menu. Prefer existing button classes over a new button API.

## Do's and Don'ts

- Do use `primary-*` / `secondary-*` utilities. Don't hard-code colors that duplicate tokens.
- Do restyle by changing utilities on the component. Don't add a new `@utility`, CSS file, or `@theme` key for a one-off.
- Do let `h1–h6` pick up `--font-heading`, and use `font-sans` for UI/body. Don't write `[font-family:var(--font-heading)]` or put the heading face on `button` / `input` / `select` / `textarea` / `kbd`.
- Do add `dark:` whenever you set surface or ink. Don't assume the white site card or hero is dark-mode inverted.
- Do use `focus-ring` and `glass` / `glass-dialog`. Don't invent a new focus outline or blur stack.
- Do keep overlay chrome in `PALETTE_CHROME` (or the same class strings). Don't mix new hover fills when nav `hover:bg-black/5` or list `hover:bg-primary-900/8 dark:hover:bg-white/10` already exist.
- Do respect reduced motion and `min-h-11` on pointer/touch controls. Don't add uncancellable animation or sub-44px tap targets on menu/palette controls.
- Do prefer `Heading`, `Text`, `Link`, `Prose`, and existing button classes. Don't introduce a second type ramp or button API.

## Updating this file

- Add or update when a pattern is shared or settled, a shared component is added, moved, or renamed, or a rule is corrected in review.
- Don't add token values (`theme.css` is the source of truth), one-off page styling, or anything the code already makes obvious.
- Remove rules whose component is gone.
