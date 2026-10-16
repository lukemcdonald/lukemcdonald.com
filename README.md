# Luke McDonald

My personal website re-built with [Astro](https://astro.build). This is my playground.

🌐 **Live Site**: [lukemcdonald.com](https://lukemcdonald.com)

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator with vanilla scripts
- **[Netlify](https://netlify.com)** - Deployment and hosting. A scheduled function (`netlify/functions/daily-rebuild`) POSTs to `NETLIFY_BUILD_HOOK_URL` daily at 10:00 UTC (~5am CT) so the YouVersion verse of the day stays current. Set that env var in the Netlify UI (do not commit it); if unset, the function logs and exits.
- **[Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)** - Analytics. Token from Cloudflare dashboard, Analytics & Logs, Web Analytics, Add a site; set `CLOUDFLARE_ANALYTICS_TOKEN` as a Netlify environment variable (production or all contexts; the beacon only loads when `CONTEXT` is `production`, via first-party paths proxied in `public/_redirects`).
- **[TailwindCSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://typescriptlang.org)** - Type-safe development
