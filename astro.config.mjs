// @ts-check
import netlify from '@astrojs/netlify'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import ogKit from 'astro-og-kit/integration'

import { defineConfig, fontProviders } from 'astro/config'

import { FONT_SOURCE_FAMILIES } from './src/components/Settings/Font/pairings.js'
import { ENV_SCHEMA } from './src/configs/env.js'
import { GLOBAL_CONFIG } from './src/configs/global.js'
import { og } from './src/og.js'
import { createHtmlRedirectsIntegration } from './src/utils/html-redirects.js'

const SITEMAP_EXCLUSIONS = new Set([`${GLOBAL_CONFIG.site.origin}/index`])

function resolveSiteUrl() {
  const context = process.env.CONTEXT
  const deployPrimeUrl = process.env.DEPLOY_PRIME_URL

  if (deployPrimeUrl && (context === 'deploy-preview' || context === 'branch-deploy')) {
    return deployPrimeUrl
  }

  return GLOBAL_CONFIG.site.origin
}

export default defineConfig({
  adapter: netlify(),
  build: {
    format: 'directory',
  },
  env: {
    schema: ENV_SCHEMA,
  },
  fonts: FONT_SOURCE_FAMILIES.map((family) => {
    return {
      ...family,
      provider: fontProviders.fontsource(),
    }
  }),
  image: {
    layout: 'constrained',
    responsiveStyles: false, // breaks with Tailwind if enabled
  },
  integrations: [
    ogKit(og),
    sitemap({
      filter: (page) => {
        if (SITEMAP_EXCLUSIONS.has(page)) {
          return false
        }
        if (page.includes('/dev/')) {
          return false
        }
        return true
      },
    }),
    createHtmlRedirectsIntegration(),
  ],
  prefetch: {
    prefetchAll: true,
  },
  server: {
    port: 3000,
  },
  session: false,
  site: resolveSiteUrl(),
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
})
