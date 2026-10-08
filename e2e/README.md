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

Specs import `test` and `expect` from `../fixtures`, never from `@playwright/test`.

`test.extend` injects:

- Page objects (`homePage`, `sitePage`)
- Component objects (`commandPalette`, `siteHeader`, `siteNav`, `skipLink`, `themeToggle`)
- `makeAxeBuilder()` — Playwright's recommended factory fixture so every scan uses the same WCAG 2.x A/AA tags

Component objects are composed into `BasePage` (and `SiteHeader`) so pages do not re-declare locators. Fixtures still expose the components for tests that only need one piece of chrome.

### Page Object Model

- `BasePage` owns `goto`, `main`, skip link, and header composition.
- Route-specific pages add only the locators that route needs (`HomePage.greetingLink`).
- Keep public methods limited to what specs call. Fallow reports unused exports and class members.

`goto({ path, theme })` uses a one-shot `addInitScript` to seed `localStorage` before the first document load so axe can sweep light and dark without driving the appearance UI. Later navigations in the same tab do not overwrite a choice the UI made.

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
- Generated IDs from `toHrefTestId` / `toNavMenuId` in `src/features/navigation/navigation.utils.ts` (imported by components and e2e so the contract cannot drift): `nav-link-resume`, `greeting-link-i-am-a--christian`, `nav-menu-work`. Path slashes become `--` so `/a/foo/bar` and `/a/foo-bar` stay distinct.
- Duplicate `nav-link-*` IDs exist in the desktop nav and mobile menu. Scope locators to `desktop-nav` or `mobile-menu`, do not filter on CSS visibility.

Add the attribute on the Astro/React element the test actually uses. Do not sprinkle test IDs on purely decorative nodes.

## Assertions

Prefer web-first assertions (`toBeVisible`, `toBeFocused`, `toHaveURL`). Do not use `waitForTimeout`. Tests are isolated: each gets a fresh context, cookies, and storage.

Tags:

- `@axe` — WCAG sweep. Chromium only; extra browsers and mobile skip it.
- `@desktop` — command palette (`client:media` hover/fine pointer). Mobile skips it via `grepInvert`.
- `@a11y` — skip-link and visible-focus specs
- `@smoke` — navigation, theme, command palette

Filter with `pnpm exec playwright test --grep @smoke`.

## Adding a page

1. Add `{ id, path }` to `ROUTES`.
2. If the route has unique interactive chrome, add `e2e/pages/{name}.page.ts` extending `BasePage` and register it in `e2e/fixtures/index.ts`.
3. Add `data-testid` attributes only for elements the new tests click or reference.
4. If the page reuses existing chrome, the axe sweep is enough until a feature spec needs it.

## Adding a test

1. Put it in `e2e/specs/{feature}.spec.ts` (skip link, theme, navigation, …), not `home.spec.ts`.
2. Import `{ expect, test }` from `../fixtures`.
3. Drive the UI through page/component objects.
4. Tag with `@axe`, `@a11y`, `@desktop`, or `@smoke` when it fits.

Do not cover the Konami / aurora easter eggs.

## Running and debugging

```sh
pnpm test:e2e          # headless, starts build + static preview
pnpm test:e2e:ui       # Playwright UI mode (watch, time travel)
pnpm exec playwright test --debug
pnpm exec playwright show-report
pnpm exec playwright test --trace on
```

Local default and the PR browser set (`E2E_BROWSERS=pr`, the default): Chromium and Pixel 5. `E2E_BROWSERS=full` adds Firefox and WebKit (without the axe sweep). CI passes that same env into `pnpm test:e2e`.

`reuseExistingServer` is on locally. The suite listens on `E2E_PORT` (default `4173`), not the Astro dev port (`4321`), so a stray `astro dev` is not reused. If you already built and served that URL, the suite will reuse it. Otherwise `webServer` runs `pnpm build && pnpm preview:static`.

UI mode is the best authoring loop. For a CI failure, download the `playwright-report` artifact (includes traces on retry) and open it with `pnpm exec playwright show-report`.

## CI

`.github/workflows/ci.yml` still runs on `pull_request` and `push` to `main`. It owns validate and audit, plus a workflow-level `concurrency` group that cancels superseded PR runs and never cancels `main`. Its `e2e` job calls the reusable workflow:

```yaml
e2e:
  uses: ./.github/workflows/e2e.yml
  with:
    browsers: pr # or full
```

CI passes `pr` on pull requests and `full` on pushes to `main`. The called job sets `E2E_BROWSERS` to that value, installs Chromium only for `pr` (or every browser for `full`), and runs `pnpm test:e2e`. Playwright reads the same env, so the matrix matches the install. GitHub reports the CI check as `e2e / e2e` (caller job / callee job). A manual run of this workflow is labeled `E2E / e2e`.

### Manual run

1. Actions → **E2E** → **Run workflow**.
2. Pick the branch and browser set (`pr` is the default; `full` is the main matrix).
3. Run. Failures upload `playwright-report` (HTML report plus traces).

Manual runs use a separate concurrency group (`e2e-workflow_dispatch-<ref>`) so they do not cancel, or get cancelled by, the CI caller.

### Reuse on another site

Copy `.github/workflows/e2e.yml` into that repo (it expects pnpm, `.nvmrc`, `pnpm test:e2e`, and a Playwright config that honors `E2E_BROWSERS=pr|full`). Then call it from that site's CI the same way:

```yaml
jobs:
  e2e:
    uses: ./.github/workflows/e2e.yml
    with:
      browsers: pr
```

Point `playwright.config.ts` at `process.env.E2E_BROWSERS === 'full'` for the full project list and treat every other value as the PR set, so Actions, `workflow_dispatch`, and a local `E2E_BROWSERS=full pnpm test:e2e` stay in lockstep.
