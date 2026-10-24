# End-to-end tests

Playwright suite for browser-level behavior and accessibility. Unit tests stay in `src/**/*.test.ts` (`pnpm test`). Specs are `*.spec.ts`, run with `pnpm test:e2e`.

`@astrojs/netlify` does not implement `astro preview`. Playwright builds production output and serves `dist/` with `scripts/preview-static.mjs`, mapping directory routes (`/resume` → `dist/resume/index.html`) without trailing slashes.

## Folder layout

```
e2e/
  constants.ts
  routes.ts                 Public routes and themes
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

`test.extend` injects page objects (`homePage`, `sitePage`), component objects, and `makeAxeBuilder()` so every axe scan uses the same WCAG 2.x A/AA tags. Component objects are composed into `BasePage` so pages do not re-declare locators. Fixtures still expose components for tests that only need one piece of chrome.

### Page Object Model

- `BasePage` owns `goto`, `main`, skip link, and header composition.
- Route-specific pages add only locators that route needs.
- Keep public methods limited to what specs call. Fallow reports unused exports.

`goto({ path, theme })` uses a one-shot `addInitScript` to seed `localStorage` before the first load so axe can sweep light and dark without driving the appearance UI. Later navigations in the same tab do not overwrite a choice the UI made.

### Routes

`e2e/routes.ts` lists every public page. Accessibility specs loop `ROUTES` × `THEMES`. Add a published page there; the axe sweep picks it up. Dev-only routes (`/dev/*`) stay out.

## Locator convention

Prefer `getByTestId` over copy-based locators because visible text changes.

| Use                                                 | When                                                     |
| --------------------------------------------------- | -------------------------------------------------------- |
| `page.getByTestId('...')`                           | Clicking, filling, waiting on, or referencing an element |
| `getByRole` / `toHaveRole` / `toHaveAccessibleName` | Asserting accessibility semantics                        |
| `getByText` / CSS / XPath                           | Do not use                                               |
| `data-testid` in `src/**/*.test.ts`                 | Do not use; unit tests stay implementation-focused       |

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
- `@desktop` — command palette (hover/fine pointer). Mobile skips via `grepInvert`.
- `@a11y` — skip-link and visible-focus specs
- `@smoke` — navigation, theme, command palette

Filter with `pnpm exec playwright test --grep @smoke`.

## Adding a page

1. Add `{ id, path }` to `ROUTES`.
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

`reuseExistingServer` is on locally. The suite listens on `E2E_PORT` (default `4173`), not the Astro dev port (`4321`). If that URL is already served, the suite reuses it; otherwise `webServer` runs `pnpm build && pnpm preview:static`.

For a CI failure, download the `playwright-report` artifact and open it with `pnpm exec playwright show-report`.

## CI

`.github/workflows/ci.yml` runs on `pull_request` and `push` to `main` (validate, audit, E2E). The E2E job lives in `.github/workflows/e2e.yml` and is reused via `workflow_call`. The Playwright image tag is `PLAYWRIGHT_VERSION` in that file and must match `@playwright/test` in the lockfile. `E2E_BROWSERS` is `pr` on pull requests and `full` on `main`. GitHub nests reusable jobs, so the CI check is `CI / E2E / Playwright`.

Manual runs use the same file (`workflow_dispatch`) as `End-to-end tests / Playwright`.

`playwright.config.ts` treats `E2E_BROWSERS === 'full'` as the full project list and every other value as the PR set.
