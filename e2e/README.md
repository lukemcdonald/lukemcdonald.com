# End-to-end tests

Playwright suite for browser-level behavior and accessibility. Unit tests stay in `src/**/*.test.ts` (`pnpm test`). Specs are `*.spec.ts`, run with `pnpm test:e2e`.

`@astrojs/netlify` does not implement `astro preview`. Playwright builds production output and serves `dist/` with `scripts/preview-static.mjs`, mapping directory routes (`/resume` → `dist/resume/index.html`) without trailing slashes.

## Folder layout

```
e2e/
  constants.ts
  routes.ts                 Public routes derived from site data
  fixtures/index.ts         test.extend: page objects + makeAxeBuilder
  components/               Shared UI objects
  pages/                    One object per route family
  helpers/
  specs/                    Specs by feature
playwright.config.ts
scripts/preview-static.mjs
```

## Architecture

Specs import `test` and `expect` from `../fixtures`, never from `@playwright/test`.

`test.extend` injects page objects (`homePage`, `resumePage`, `sitePage`) and `makeAxeBuilder()` so every axe scan uses the same WCAG 2.x A/AA tags. Each page and component object has one access path: fixtures expose pages; pages compose components. Do not also register those components as fixtures.

### Page Object Model

- `BasePage` owns `goto`, `main`, skip link, and header composition.
- Route-specific pages add only locators that route needs.
- Keep public methods limited to what specs call. Fallow reports unused exports.

`goto({ path, theme })` uses a one-shot `addInitScript` to seed `localStorage` before the first load so axe can sweep light and dark without driving the appearance UI. Later navigations in the same tab do not overwrite a choice the UI made.

### Routes

`e2e/routes.ts` builds `ROUTES` from published files in `src/content/pages` (same draft rule as the pages collection) plus standalone routes that are not content pages (`/resume`, `/missing-page` for 404). Paths come from `toPagePath`. Accessibility specs loop `ROUTES` × `THEMES`. A new published page such as `/work/*` is axe-checked automatically. Dev-only routes (`/dev/*`) stay out.

## Locator convention

Find elements with `getByTestId` so copy, i18n, and experiment changes do not break E2E. Assert outcomes (navigation, state, visibility), not wording. Check text only when that exact content matters, such as a page title. Accessible roles and labels are covered by axe and unit tests, not E2E selectors.

| Use                                      | When                                                     |
| ---------------------------------------- | -------------------------------------------------------- |
| `page.getByTestId('...')`                | Clicking, filling, waiting on, or referencing an element |
| `toHaveText` on a title or required line | Only when that exact content matters                     |
| `getByRole` / `getByText` / CSS / XPath  | Do not use to find elements                              |
| `data-testid` in `src/**/*.test.ts`      | Do not use; unit tests stay implementation-focused       |

`playwright.config.ts` sets `testIdAttribute: 'data-testid'`.

Naming:

- kebab-case
- Prefix by region: `site-header`, `site-nav`, `command-palette-input`
- Generated IDs from `toHrefTestId` / `toNavMenuId` in `src/features/navigation/navigation.utils.ts`: `nav-link-resume`, `greeting-link-i-am-a--christian`, `nav-menu-work`. Path slashes become `--`.
- Duplicate `nav-link-*` IDs exist in desktop nav and mobile menu. Scope locators to `desktop-nav` or `mobile-menu`.

Add the attribute on the Astro element the test actually uses.

## Assertions

Prefer web-first assertions (`toBeVisible`, `toBeFocused`, `toHaveURL`). Do not use `waitForTimeout`. Each test gets a fresh context.

Tags:

- `@axe` — WCAG sweep. Chromium only.
- `@desktop` — command palette. Mobile skips via `grepInvert`.
- `@a11y` — skip-link specs
- `@smoke` — navigation, theme, command palette

Filter with `pnpm exec playwright test --grep @smoke`.

## Adding a page

1. Published content pages are picked up from `src/content/pages`. For a standalone route, add `{ id, path }` to `STANDALONE_ROUTES` in `e2e/routes.ts`.
2. If the route has unique interactive chrome, add `e2e/pages/{name}.page.ts` extending `BasePage` and register it in `e2e/fixtures/index.ts`.
3. Add `data-testid` only for elements the new tests click or reference.

## Adding a test

1. Put it in `e2e/specs/{feature}.spec.ts`, not `home.spec.ts`.
2. Import `{ expect, test }` from `../fixtures`.
3. Drive the UI through page/component objects.
4. Tag with `@axe`, `@a11y`, `@desktop`, or `@smoke` when it fits.

Do not cover the Konami / aurora easter eggs.

## Running and debugging

```sh
pnpm test:e2e          # headless, starts build + static preview
pnpm test:e2e:ui       # Playwright UI mode
pnpm exec playwright test --debug
pnpm exec playwright show-report
pnpm exec playwright test --trace on
```

Default and PR set (`E2E_BROWSERS=pr`): Chromium and Pixel 5. `E2E_BROWSERS=full` adds Firefox and WebKit (without axe). CI uses the same env.

The suite tests a local production build. `reuseExistingServer` is on locally. The suite listens on `E2E_PORT` (default `4173`), not the Astro dev port (`4321`). If that URL is already served, the suite reuses it; otherwise `webServer` runs `pnpm build && pnpm preview:static`. `PLAYWRIGHT_BASE_URL` overrides the origin and skips the local preview server.

For a CI failure, download the `playwright-report` artifact and open it with `pnpm exec playwright show-report`.

## CI

`.github/workflows/ci.yml` runs on `pull_request` and `push` to `main` (validate, audit, E2E). The E2E job uses `mcr.microsoft.com/playwright:v<@playwright/test>-noble` instead of `playwright install --with-deps`. `E2E_BROWSERS` is `pr` on pull requests and `full` on `main`. The check is `CI / E2E`.

Manual runs use `.github/workflows/e2e.yml` (`workflow_dispatch`) with a separate concurrency group so they do not cancel CI.

`playwright.config.ts` treats `E2E_BROWSERS === 'full'` as the full project list and every other value as the PR set.
