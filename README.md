# Luke McDonald

My personal website re-built with [Astro](https://astro.build). This is my playground.

🌐 **Live Site**: [lukemcdonald.com](https://lukemcdonald.com)

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator with partial hydration
- **[Netlify](https://netlify.com)** - Deployment and hosting
- **[PostHog](https://posthog.com)** - Analytics
- **[React](https://react.dev)** - Interactive components
- **[TailwindCSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://typescriptlang.org)** - Type-safe development

## Writing content

Content lives in `src/content/pages`. Frontmatter supports friendly date fields that are normalized for SEO and filtering:

```md
---
title: 'Post title'
date: 2025-08-31        # optional: published date (YYYY-MM-DD or ISO)
updated: 2025-09-01     # optional: last modified date
# Advanced (also supported):
# pubDatetime: 2025-08-31T14:00:00Z
# modDatetime: 2025-09-01T16:30:00-05:00
---
```

- If both `date` and `pubDatetime` are set, `pubDatetime` wins.
- If both `updated` and `modDatetime` are set, `modDatetime` wins.
- Strings are coerced to dates, so you can use `YYYY-MM-DD` or full ISO timestamps.
