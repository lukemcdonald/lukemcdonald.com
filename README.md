# Luke McDonald

Personal website at [lukemcdonald.com](https://lukemcdonald.com). This is my playground.

Astro, Tailwind CSS, TypeScript, Netlify.

Read-only MCP at `/mcp`. LLM summary at `/llms.txt`.

## Setup

```sh
pnpm install
```

## Commands

```sh
pnpm dev          # local server
pnpm build        # production build
pnpm validate     # lint, format, astro check, unit tests
pnpm test         # unit tests
pnpm test:e2e     # Playwright
pnpm preview      # Netlify draft deploy
pnpm deploy:prod  # Netlify production deploy
```

Hosted on Netlify. `pnpm preview` is a draft deploy, not a local server.
