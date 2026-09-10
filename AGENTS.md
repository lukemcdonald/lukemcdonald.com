# Agent Instructions

Personal website built with Astro. Keep changes focused and match existing patterns.

## Workflow

- Package manager: **pnpm**
- Before marking any task complete: run `pnpm validate` and `pnpm typecheck`
- After meaningful TypeScript or JavaScript changes, run `pnpm run audit:code`
- Never run `pnpm dev` unless instructed

Use the Fallow skill for deeper audit and debug workflows.

## Conventions

- No emojis anywhere: code, commits, descriptions, PR titles
- Alphabetize: imports, object keys, destructured props, component prop lists
  - Exception: group related items together if alphabetical order hurts readability
- Put `return` on its own line. Do not use inline returns.
- Conventional commits without a scope and without a details body
- When spreading leftover props onto a child, name the rest `delegated`

## Code Comments

JSDoc only when adding context beyond the function name (1–2 lines max). Skip `@param`/`@returns` unless documenting non-obvious constraints, defaults, or side effects. Never: commented-out code, obvious comments, redundant type docs.

## Linear

Always use the **lukemcdonald.com** project (`f04167ed-3a9c-48ad-ac93-bea8ca389005`) when searching, creating, or updating Linear issues for this codebase.

## Architecture

### Directory Structure

- `src/pages/` — Astro routes
- `src/layouts/` — Page shells
- `src/components/` — Shared UI (Astro and React islands)
- `src/features/` — Domain modules (navigation, pages, resume)
- `src/content/` — Content collections (pages markdown, resume yaml)
- `src/configs/` — Site, env, content, and sound config
- `src/utils/` — Generic utilities
- `src/assets/` — Images and global styles

**Path Alias:** `@/*` maps to `src/*`

### Feature Structure

```sh
src/features/{domain}/
├─ components/           # Feature-specific Astro/React
├─ {domain}.schema.ts    # Content schemas
├─ {domain}.server.ts    # Collection loaders and queries
├─ {domain}.types.ts     # Types
├─ {domain}.utils.ts     # Pure helpers
└─ {domain}.utils.test.ts
```

### Component Organization

1. **Shared** — `src/components/`
2. **Feature** — `src/features/{domain}/components/`
3. **React islands** — folder with `index.ts`, `types.ts`, `constants.ts`, `utils.ts` as needed

Do not import from `@lucide/astro`. Import icons directly:

```ts
import ChevronDown from '@lucide/astro/icons/chevron-down'
```

### Content

Pages live in `src/content/pages` as markdown. Resume data lives in `src/content/resume` as yaml. Collection metadata is in `src/configs/content.ts`. Schemas and loaders are wired in `src/content.config.ts`.

## React

React 19 compiler auto-optimizes. Do not use `React.memo()`, `useMemo()`, or `useCallback()` unless the work is genuinely expensive.

Import React types explicitly:

```ts
import type { ReactNode } from 'react'
```

## Testing

- Runner: `pnpm test` (`tsx --test 'src/**/*.test.ts'`)
- Use `node:test` and `node:assert/strict`
- Colocate tests as `*.test.ts` next to the module
