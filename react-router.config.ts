import { sentryOnBuildEnd } from '@sentry/react-router'

import type { Config } from '@react-router/dev/config'

export default {
  buildEnd: async ({ buildManifest, reactRouterConfig, viteConfig }) => {
    // Call this at the end of the hook
    await sentryOnBuildEnd({ buildManifest, reactRouterConfig, viteConfig })
  },
  ssr: true,
} satisfies Config
