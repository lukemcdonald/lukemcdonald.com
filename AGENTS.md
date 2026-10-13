# Agent Instructions

Personal website built with Astro. Keep changes focused and match existing patterns.

## Workflow

- Package manager: **pnpm**
- Before marking any task complete: run `pnpm validate` and `pnpm typecheck`
- After meaningful TypeScript or JavaScript changes, run `pnpm run audit:code`
- Start the dev server with `pnpm dev --background`. Check it with `pnpm astro dev status`. Stop it with `pnpm astro dev stop` when done.

Use the Fallow skill for deeper audit and debug workflows.

## Conventions

- No emojis anywhere: code, commits, descriptions, PR titles
- Alphabetize: imports, object keys, destructured props, component prop lists
  - Exception: group related items together if alphabetical order hurts readability
- Put `return` on its own line. Do not use inline returns.
- When spreading leftover props onto a child, name the rest `delegated`

## Commits and pull requests

PRs are squash-merged, so the PR title becomes the commit on main. Use Conventional Commits for git commits and PR titles:

`type: description`

CI enforces that format on the PR title (types below, no scope). Append `[VOLTA-123]` when there is a Linear issue. No details body.

Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

## Code Comments

JSDoc only when adding context beyond the function name (1–2 lines max). Skip `@param`/`@returns` unless documenting non-obvious constraints, defaults, or side effects. Never: commented-out code, obvious comments, redundant type docs.

## Linear

Always use the **lukemcdonald.com** project (`f04167ed-3a9c-48ad-ac93-bea8ca389005`) when searching, creating, or updating Linear issues for this codebase.

## Architecture

### Directory Structure

- `src/pages/` — Astro routes
- `src/layouts/` — Page shells
- `src/components/` — Shared UI (Astro and vanilla scripts)
- `src/features/` — Domain modules (navigation, pages, resume)
- `src/content/` — Content collections (pages markdown, resume yaml)
- `src/configs/` — Site, env, content, and sound config
- `src/utils/` — Generic utilities
- `src/assets/` — Images and global styles

**Path Alias:** `@/*` maps to `src/*`

### Feature Structure

```sh
src/features/{domain}/
├─ components/           # Feature-specific Astro
├─ {domain}.schema.ts    # Content schemas
├─ {domain}.server.ts    # Collection loaders and queries
├─ {domain}.types.ts     # Types
├─ {domain}.utils.ts     # Pure helpers
└─ {domain}.utils.test.ts
```

### Component Organization

1. **Shared** — `src/components/`
2. **Feature** — `src/features/{domain}/components/`
3. **Client scripts** — colocated `*.ts` modules imported from `<script>` tags, following `src/components/Nav/mobile-menu.ts`

Do not import from `@lucide/astro`. Import icons directly:

```ts
import ChevronDown from '@lucide/astro/icons/chevron-down'
```

### Content

Pages live in `src/content/pages` as markdown. Resume data lives in `src/content/resume` as yaml. Collection metadata is in `src/configs/content.ts`. Schemas and loaders are wired in `src/content.config.ts`.

## Client scripts

Prefer native HTML (`<dialog>`, `<select>`, popover) plus a small vanilla TypeScript module. Do not add React, Headless UI, or other UI runtime libraries.

## Testing

- Runner: `pnpm test` (`tsx --test 'src/**/*.test.ts'`)
- Use `node:test` and `node:assert/strict`
- Colocate tests as `*.test.ts` next to the module
- End-to-end: Playwright in `e2e/` (`*.spec.ts`). Import `test`/`expect` from `../fixtures`. See `e2e/README.md`.

## Unit tests

- Wrap `before`, `beforeEach`, `after`, and `afterEach` inside the `describe` they apply to.
- Mock with named `mock.fn` or `mock.method`. Restore in `afterEach` with `mock.restoreAll()`.
- One `describe` per unit. Cases use `test('...')`, not `it`.
- File-local helpers go after the imports and before the `describe` blocks.
