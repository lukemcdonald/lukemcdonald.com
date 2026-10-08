# End-to-end tests

Playwright suite for browser-level behavior and automated accessibility checks. Unit tests stay in `src/**/*.test.ts` (`node:test` via `pnpm test`). This suite lives here, uses `*.spec.ts`, and is run with `pnpm test:e2e`.

The `@astrojs/netlify` adapter does not implement `astro preview`. Playwright instead builds the production output and serves `dist/` with `scripts/preview-static.mjs`, which maps Astro directory routes (`/resume` → `dist/resume/index.html`) without trailing slashes.

## Folder layout

```
e2e/
  README.md
  constants.ts              Test IDs, WCAG tags, theme storage key
  routes.ts                 Every public route and theme (single source of truth)
  fixtures/index.ts         test.extend: page objects + makeAxeBuilder
  components/               Shared UI objects composed into pages
    command-palette.ts
    site-header.ts
    site-nav.ts
    skip-link.ts
    theme-toggle.ts
  pages/                    One object per route family
    base.page.ts            Shared chrome: skip link, header, main, goto
    home.page.ts
    resume.page.ts
  helpers/                  Assertion helpers (axe summaries, focus rings)
  specs/                    Specs by feature, not by page
    accessibility.spec.ts
    command-palette.spec.ts
    focus.spec.ts
    navigation.spec.ts
    skip-link.spec.ts
    theme.spec.ts
playwright.config.ts
scripts/preview-static.mjs
```

## Architecture

### Fixtures

Specs import `test` and `expect` from `e2e/fixtures`, never from `@playwright/test`.

`test.extend` injects:

- Page objects (`homePage`, `resumePage`, `sitePage`)
- Component objects (`commandPalette`, `siteHeader`, `siteNav`, `skipLink`, `themeToggle`)
- `makeAxeBuilder()` — Playwright's recommended factory fixture so every scan uses the same WCAG 2.x A/AA tags

Component objects are composed into `BasePage` (and `SiteHeader`) so pages do not re-declare locators. Fixtures still expose the components for tests that only need one piece of chrome.

### Page Object Model

- `BasePage` owns `goto`, `main`, skip link, and header composition.
- Route-specific pages add only the locators that route needs (`HomePage.greetingLink`).
- Keep public methods limited to what specs call. Fallow reports unused exports and class members.

`goto({ path, theme })` uses `addInitScript` to seed `localStorage` before the first document load so axe can sweep light and dark without driving the appearance UI.

### Routes

`e2e/routes.ts` lists every public page. Accessibility specs loop `ROUTES` × `THEMES`. Adding a published page means adding one entry there; the axe sweep picks it up. Dev-only routes (`/dev/*`) stay out.

## Locator convention

Playwright's locator docs treat `getByTestId` as the stable explicit contract. This site prefers that over copy-based locators because visible text changes and other sites that copy this setup use i18n.

| Use                                                 | When                                                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `page.getByTestId('...')`                           | Clicking, filling, waiting on, or referencing an element                                             |
| `getByRole` / `toHaveRole` / `toHaveAccessibleName` | Asserting accessibility semantics (skip link is a link named "Skip to content", `main` is focusable) |
| `getByText` / CSS / XPath                           | Do not use                                                                                           |
| `data-testid` in `src/**/*.test.ts`                 | Do not use; unit tests stay implementation-focused                                                   |

`playwright.config.ts` sets `testIdAttribute: 'data-testid'` explicitly so the contract is visible.

Naming:

- kebab-case
- Prefix by region: `site-header`, `site-nav`, `command-palette-input`
- Generated IDs from hrefs: `nav-link-resume`, `greeting-link-i-am-a-christian`
- Menu triggers reuse the existing `nav-menu-{group}` ids

Add the attribute on the Astro/React element the test actually uses. Do not sprinkle test IDs on purely decorative nodes.

## Assertions

Prefer web-first assertions (`toBeVisible`, `toBeFocused`, `toHaveURL`). Do not use `waitForTimeout`. Tests are isolated: each gets a fresh context, cookies, and storage.

Tags: `@a11y` for accessibility, `@smoke` for navigation, theme, and command palette. Filter with `pnpm exec playwright test --grep @smoke`.

The command palette hydrates only for hover-capable pointers (`client:media`). Those specs `test.skip` on the mobile project.

## Adding a page

1. Add `{ id, path }` to `ROUTES`.
2. If the route has unique interactive chrome, add `e2e/pages/{name}.page.ts` extending `BasePage` and register it in `e2e/fixtures/index.ts`.
3. Add `data-testid` attributes only for elements the new tests click or reference.
4. If the page reuses existing chrome, the axe sweep is enough until a feature spec needs it.

## Adding a test

1. Put it in `e2e/specs/{feature}.spec.ts` (skip link, theme, navigation, …), not `home.spec.ts`.
2. Import `{ expect, test }` from `../fixtures`.
3. Drive the UI through page/component objects.
4. Tag with `@a11y` or `@smoke` when it fits.

Do not cover the Konami / aurora easter eggs.

## Running and debugging

```sh
pnpm test:e2e          # headless, starts build + static preview
pnpm test:e2e:ui       # Playwright UI mode (watch, time travel)
pnpm exec playwright test --debug
pnpm exec playwright show-report
pnpm exec playwright test --trace on
```

Local default projects: Chromium and Pixel 5. CI also runs Firefox and WebKit.

`reuseExistingServer` is on locally. If you already built and served `http://127.0.0.1:4321`, the suite will reuse it. Otherwise `webServer` runs `pnpm build && pnpm preview:static`.

UI mode is the best authoring loop. For a CI failure, download the `playwright-report` artifact (includes traces on retry) and open it with `pnpm exec playwright show-report`.
