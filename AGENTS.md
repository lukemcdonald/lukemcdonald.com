# Agent Instructions

Keep changes focused and match existing patterns.

## Conventions

- No emojis anywhere: code, commits, descriptions, PR titles
- UI and styling: follow DESIGN.md, and update it in the same PR when a UI pattern changes
- Alphabetize: imports, object keys, destructured props, component prop lists
  - Exception: group related items together if alphabetical order hurts readability
- Put `return` on its own line. Do not use inline returns.
- When spreading leftover props onto a child, name the rest `delegated`

## Naming

- `get*`: cheap sync read of existing data, or a computed value from inputs; never async or side effects
- `load*` / `fetch*`: read data/content via async or I/O (`fetch*` for network)
- `resolve*`: find or compute a path/value via lookup; returns the location, not contents
- `to*`: data shape in, data shape out (pure conversion)
- `create*` / `build*`: construct a new object, handler, or output (`build*` for a URL, string, or object from parts)
- `is*` / `has*` / `can*`: booleans
- `normalize*` / `parse*` / `format*`: clean input, validate, or display string (`format*` for labels, CSS values, and human text)
- `handle*` / `on*`: request and event handlers
- Constants `SCREAMING_CASE`; types and components PascalCase nouns; only standard abbreviations (`id`, `url`)
- Leave framework-required names unchanged (`getStaticPaths`, `GET`)

## Commits and pull requests

PRs are squash-merged, so the PR title becomes the commit on main. Use Conventional Commits for git commits and PR titles:

`type: description`

CI enforces that format on the PR title (types below, no scope). No details body.

Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

## Code Comments

JSDoc only when adding context beyond the function name (1–2 lines max). Skip `@param`/`@returns` unless documenting non-obvious constraints, defaults, or side effects. Never: commented-out code, obvious comments, redundant type docs.

## Component Organization

Client scripts are colocated `*.ts` modules imported from `<script>` tags, following `src/features/navigation/components/mobile-menu.ts`.

Do not import from `@lucide/astro`. Import icons directly:

```ts
import ChevronDown from '@lucide/astro/icons/chevron-down'
```

## Client scripts

Prefer native HTML (`<dialog>`, `<select>`, popover) plus a small vanilla TypeScript module. Do not add React, Headless UI, or other UI runtime libraries.

## Unit tests

- Wrap `before`, `beforeEach`, `after`, and `afterEach` inside the `describe` they apply to.
- Mock with named `mock.fn` or `mock.method`. Restore in `afterEach` with `mock.restoreAll()`.
- One `describe` per unit. Cases use `test('...')`, not `it`.
- File-local helpers go after the imports and before the `describe` blocks.
