# Luke McDonald

Personal website at [lukemcdonald.com](https://lukemcdonald.com). This is my playground.

Read-only MCP at `/mcp`. LLM summary at `/llms.txt`.

## Stack

- **App:** [Astro](https://docs.astro.build/), [Tailwind CSS](https://tailwindcss.com/docs) v4, [TypeScript](https://www.typescriptlang.org/docs/)
- **Analytics:** [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/)
- **Lint/format:** [ESLint](https://eslint.org/docs/latest/) + [Prettier](https://prettier.io/docs/en/)
- **Testing:** node:test + [Playwright](https://playwright.dev/docs/intro)
- **Deploy:** [Netlify](https://docs.netlify.com/)

## Setup

**Needs:** Node.js 24+ (see `.nvmrc`), pnpm

1. Clone and install:

```bash
pnpm install
```

2. Start local development:

```bash
pnpm dev
```

### Useful scripts

| Script           | What it does                                |
| ---------------- | ------------------------------------------- |
| `pnpm fix`       | Lint + format fix                           |
| `pnpm typecheck` | TypeScript check                            |
| `pnpm test`      | node:test (`src/**/*.test.ts`)              |
| `pnpm test:e2e`  | Playwright (`e2e/specs/*.spec.ts`)          |
| `pnpm validate`  | Lint, format check, astro check, unit tests |
| `pnpm build`     | Production Astro build                      |

### Deploy

Netlify. `pnpm preview` is a draft deploy; `pnpm deploy:prod` publishes production.
