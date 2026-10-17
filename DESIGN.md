---
version: alpha
name: lukemcdonald.com
description: Personal site design system as implemented today. Tokens are the default theme (`@theme` in src/assets/styles/theme.css) and default font (no `data-font`). Runtime themes and pairings remap the same CSS variables.
colors:
  on-primary: '{colors.primary-900}'
  on-surface: '{colors.primary-900}'
  primary: 'oklch(73.7% 0.019 106)'
  primary-50: 'oklch(98.4% 0.001 106)'
  primary-200: 'oklch(92.3% 0.002 480)'
  primary-500: '{colors.primary}'
  primary-700: 'oklch(39.6% 0.022 192)'
  primary-800: 'oklch(32.7% 0.052 117)'
  primary-900: 'oklch(17.1% 0.025 212)'
  primary-950: 'oklch(6% 0.02 212)'
  secondary: 'oklch(73.7% 0.08 25)'
  surface: '#ffffff'
  white: '#ffffff'
typography:
  body-lg:
    fontFamily: ui-sans-serif
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: ui-sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  headline-lg:
    fontFamily: ui-sans-serif
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1
  headline-md:
    fontFamily: ui-sans-serif
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.75rem
  label-caps:
    fontFamily: ui-sans-serif
    fontSize: 0.75rem
    fontWeight: 500
    letterSpacing: 0.05em
    lineHeight: 1rem
  nav:
    fontFamily: ui-sans-serif
    fontSize: 1rem
    fontWeight: 600
    letterSpacing: 0.025em
rounded:
  3xl: 1.5rem
  full: 9999px
  lg: 0.5rem
  md: 0.375rem
  sm: 0.25rem
  xl: 0.75rem
  xs: 0.125rem
spacing:
  lg: 1.25rem
  md: 1rem
  site-height: 720px
  site-max: 80rem
  sm: 0.5rem
  touch: 2.75rem
  unit: 0.25rem
  xl: 2rem
  xs: 0.25rem
components:
  button-icon:
    backgroundColor: '{colors.surface}'
    height: '{spacing.touch}'
    rounded: '{rounded.lg}'
    textColor: '{colors.on-surface}'
    width: '{spacing.touch}'
  button-nav:
    backgroundColor: '{colors.primary-500}'
    padding: 0.5rem
    rounded: '{rounded.md}'
    textColor: '{colors.on-primary}'
    typography: '{typography.nav}'
  button-nav-hover:
    backgroundColor: '{colors.primary-500}'
    textColor: '{colors.on-primary}'
  button-primary:
    backgroundColor: '{colors.primary-700}'
    padding: 0.5rem
    rounded: '{rounded.md}'
    textColor: '{colors.primary-50}'
  button-primary-hover:
    backgroundColor: 'color-mix(in oklab, var(--color-primary-700) 80%, transparent)'
    textColor: '{colors.primary-50}'
  card-connect:
    backgroundColor: '{colors.surface}'
    padding: '{spacing.lg}'
    textColor: '{colors.primary-800}'
  card-content:
    backgroundColor: '{colors.primary-900}'
    padding: '{spacing.lg}'
    textColor: '{colors.white}'
    typography: '{typography.body-lg}'
  card-entry:
    backgroundColor: '{colors.primary-800}'
  card-glass:
    backgroundColor: 'color-mix(in oklab, white 64%, transparent)'
    padding: 0.25rem
    rounded: '{rounded.md}'
    textColor: '{colors.on-surface}'
  card-hero:
    backgroundColor: '{colors.primary-500}'
    padding: '{spacing.lg}'
    textColor: '{colors.on-primary}'
  card-site:
    backgroundColor: '{colors.surface}'
    width: '{spacing.site-max}'
  divider:
    backgroundColor: '{colors.primary-200}'
  input-select:
    backgroundColor: '{colors.surface}'
    height: '{spacing.touch}'
    padding: 0.5rem
    rounded: '{rounded.lg}'
    textColor: '{colors.on-surface}'
    typography: '{typography.body-md}'
  pill:
    backgroundColor: '{colors.primary}'
    padding: 0.25rem
    rounded: '{rounded.xs}'
    textColor: '{colors.on-primary}'
  prose-heading:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary-950}'
    typography: '{typography.headline-md}'
  quote-invert:
    backgroundColor: '{colors.primary-900}'
    textColor: '{colors.secondary}'
  skip-link:
    backgroundColor: '{colors.primary-900}'
    padding: 0.5rem
    rounded: '{rounded.md}'
    textColor: '{colors.primary-50}'
---

## Overview

Personal site with a landscape-led home shell: tinted page chrome, a white desktop "site card", a mid-tone hero with mountains, and a dark content panel. Overlays (nav menus, command palette) use the `glass` utility. Users can retint the palette, flip light/dark, change glass density, and swap font pairings at runtime. Restyle through existing Tailwind theme utilities and CSS variables; do not add a parallel palette or type ramp.

## Colors

Tokens live in `src/assets/styles/theme.css` as `--color-primary-50`…`--color-primary-950` and `--color-secondary-*`. Use utilities such as `bg-primary-50`, `text-primary-900`, `decoration-primary-500`. YAML values are the **default** theme (`@theme` / no `data-theme`).

- **Primary scale:** Warm low-chroma stone. Page chrome `bg-primary-50` / `dark:bg-primary-900`. Hero `bg-primary-500`. Entry shell `bg-primary-800`. Content panel and logo tile `bg-primary-900`. Ink `text-primary-900` (headings in prose `primary-950`). Filled action `bg-primary-700 text-primary-50`.
- **Secondary:** Coral complementary, `--color-secondary-base` mixed toward white/black for 50–950. Used sparingly (prose invert quotes/lead, easter eggs), not as a second brand UI color.
- **Light/dark:** `.dark` on `<html>` (class strategy: `@custom-variant dark (&:where(.dark, .dark *))`). Same scale; pick shades with `dark:` (`text-primary-50`, `dark:bg-white/10`). Default mode is `system`.
- **Brand themes:** `data-theme` on `<html>` (`default`, `blue`, `emerald`, `orange`, `purple`, `yellow`). Non-default themes rewrite `--color-primary-*` and `--color-secondary-base`. `default` removes `data-theme` so `@theme` values apply. Swatch previews may set `[data-theme]` locally.

## Typography

Default (no `data-font`): Tailwind `--font-sans` (`ui-sans-serif`). Headings use `font-family: var(--font-heading, inherit)`. `Heading` / `Text` map `weight="bold"` to `font-semibold`. Home `h1` is `text-5xl`; section `Heading` defaults to `text-xl`. Entry body is `text-lg leading-normal`. Nav triggers are `text-base font-semibold tracking-wide uppercase`. Group labels are `text-xs font-medium tracking-wider uppercase`. Long-form: `Prose` (`prose max-w-[70ch] dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl`).

Selectable pairings (`src/components/Settings/Font/pairings.ts`) set `html[data-font]`:

| Pairing | `--font-heading`  | `--font-sans` / `--font-ui` |
| ------- | ----------------- | --------------------------- |
| Work    | Space Grotesk 700 | IBM Plex Sans               |
| Play    | Fredoka 700       | Nunito                      |
| Live    | Lora 700          | Source Sans 3               |

Pairing CSS also sets `--default-font-family` and `--font-mono` to the nav face. `[data-font]` applies `--font-sans` on the document; `.site-header` and `footer` use `--font-ui`; `button, input, select, textarea, kbd` inherit the sans/UI face (not the heading face). Use `font-sans`, not arbitrary `[font-family:var(--font-heading)]`.

## Layout

Tailwind spacing (`--spacing` = 0.25rem). Header padding is `p-5`. Touch controls use `min-h-11` (2.75rem). Breakpoints in `@theme`: `xs` 420px, `sm` 576px, `md` 768px, `lg` 1080px, `xl` 1280px.

Home/page shell (`Main.astro`): outer `bg-primary-50 dark:bg-primary-900`; desktop landscape is grayscale, low opacity. Inner `.site` is `bg-white lg:max-h-site lg:w-11/12 lg:max-w-7xl` (`--max-height-site: 720px`). `.site-header` is `absolute` `p-5` `z-50`, `lg:w-1/2`. Entry uses CSS grid areas in `layout.css` (header / body / nav). Resume/prose pages use `ProseLayout` (`px-4 py-6`, `max-w-[70ch]`). The only `footer` today is resume API links.

## Elevation & Depth

Not a shadow scale. Hierarchy is **tone + glass**:

- Page chrome vs white site card (`lg:shadow-2xl`).
- Hero `primary-500` vs content `primary-900` vs connect `bg-white`.
- `glass`: 1px `var(--glass-border)`, `var(--glass-shadow)`, fallback fill, then `backdrop-filter: blur(10px)` and SVG `#glass-lens` when supported. Default glass is **tinted** (`--glass-opacity: 64%`). `data-glass='clear'` is 32%; `solid` is 100% with no blur. Dark glass mixes `primary-900`. `prefers-reduced-transparency: reduce` uses the solid fallback.
- Preference popovers: opaque `bg-white dark:bg-primary-900` + `shadow-lg`, not `glass`.
- Mobile sheet: `rounded-t-3xl` + a one-off upward shadow (not the `glass` utility).
- `focus-ring`: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900 dark:focus-visible:outline-primary-50`.

## Shapes

Stock Tailwind radii. Nav triggers and skip link: `rounded-md`. Palette rows, icon buttons, mobile selects: `rounded-lg`. Command palette panel and preference menus: `rounded-xl`. Nav dropdown: `glass rounded-md`. Mobile sheet: `rounded-t-3xl`. Status pill: `rounded-xs`. Theme check: `rounded-full`. Site card is square.

## Components

Reuse existing classes/components; do not invent variants.

- **Nav / ⌘K trigger:** Ghost `rounded-md bg-black/0 … font-semibold tracking-wide uppercase focus-ring hover:bg-black/5`. Desktop nav is `@media (hover: hover) and (pointer: fine)`; otherwise hamburger + dialog.
- **Filled button:** Resume `PrintButton` (`bg-primary-700 text-primary-50 shadow-sm hover:bg-primary-700/80`).
- **Icon control:** `h-11 w-11 rounded-lg` + `PALETTE_CHROME` hover/focus fills (`bg-primary-900/8 dark:bg-white/10`).
- **Pill:** 404 `rounded-xs bg-primary-500 px-1 font-sans text-sm font-medium uppercase text-primary-900`.
- **Cards:** Site card; hero `.entry__header`; content `.entry__content`; connect `.entry__nav`. Overlays: `glass` (nav panel, command palette `rounded-xl glass-dialog`).
- **Command palette:** Native `<dialog>`, panel `max-w-2xl`. Chrome classes live in `src/components/CommandPalette/chrome.ts` (`ink`, `muted`, `border`, `hoverFill`, `kbd`). List height animates 100ms; `prefers-reduced-motion: reduce` disables it.
- **Mobile menu:** Native `<dialog>` sheet `bg-white dark:bg-primary-900`; slide-up 200ms only under `prefers-reduced-motion: no-preference`.
- **Forms:** Mobile settings `MenuSelect` (`rounded-lg border-primary-950/15 bg-black/[0.04] … focus-ring`). Keep control text on sans/UI.
- **Prose / links:** Global `a` uses `decoration-primary-500 underline-offset-2`. Entry links underline unless `.no-underline`.
- **Motion:** Short (100–200ms). Pair with `motion-reduce:transition-none` / `motion-reduce:animate-none` or gate in `prefers-reduced-motion: no-preference`.

## Do's and Don'ts

- Do use `primary-*` / `secondary-*` utilities (`bg-primary-50`, `text-primary-900`, `dark:bg-primary-900`). Don't hard-code hex, `oklch()`, or `rgb()` that duplicate tokens (`#122023` in config/OG is existing drift, not a pattern to copy).
- Do restyle by changing utilities on the component. Don't add a new `@utility`, CSS file, or `@theme` key for a one-off.
- Do let `h1–h6` pick up `--font-heading`, and use `font-sans` for UI/body. Don't write `[font-family:var(--font-heading)]` or put the heading face on `button` / `input` / `select` / `textarea` / `kbd`.
- Do add `dark:` whenever you set surface or ink. Don't assume the white site card or `primary-500` hero is dark-mode inverted (home `.site` stays `bg-white`).
- Do use `focus-ring` and `glass` / `glass-dialog`. Don't invent a new focus outline or blur stack.
- Do keep overlay chrome in `PALETTE_CHROME` (or the same class strings). Don't mix new hover fills when `hover:bg-black/5` (nav) or `hover:bg-primary-900/8 dark:hover:bg-white/10` (lists) already exist.
- Do respect reduced motion and `min-h-11` on pointer/touch controls. Don't add uncancellable animation or sub-44px tap targets on menu/palette controls.
- Do prefer `Heading`, `Text`, `Link`, `Prose`, and existing button classes. Don't introduce a second type ramp or button API.
