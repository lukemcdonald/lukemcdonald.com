// @ts-check
import netlify from '@astrojs/netlify'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig, fontProviders } from 'astro/config'

import { GLOBAL_CONFIG } from './src/configs/global.js'
import { ENV_SCHEMA } from './src/configs/env.js'

// Sitemap exclusions
const SITEMAP_EXCLUSIONS = new Set([`${GLOBAL_CONFIG.site.origin}/index`])

function resolveSiteUrl() {
  const context = process.env.CONTEXT
  const deployPrimeUrl = process.env.DEPLOY_PRIME_URL

  if (deployPrimeUrl && (context === 'deploy-preview' || context === 'branch-deploy')) {
    return deployPrimeUrl
  }

  return GLOBAL_CONFIG.site.origin
}

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  build: {
    format: 'directory',
  },
  env: {
    schema: ENV_SCHEMA,
  },
  fonts: [
    {
      cssVariable: '--font-bricolage-grotesque',
      fallbacks: ['sans-serif'],
      name: 'Bricolage Grotesque',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: ['200 800'],
    },
    {
      cssVariable: '--font-fraunces',
      fallbacks: ['serif'],
      name: 'Fraunces',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: ['100 900'],
    },
    {
      cssVariable: '--font-ibm-plex-mono',
      fallbacks: ['monospace'],
      name: 'IBM Plex Mono',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: [400, 600, 700],
    },
    {
      cssVariable: '--font-ibm-plex-sans',
      fallbacks: ['sans-serif'],
      name: 'IBM Plex Sans',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: ['100 700'],
    },
    {
      cssVariable: '--font-inter',
      fallbacks: ['sans-serif'],
      name: 'Inter',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: ['100 900'],
    },
    {
      cssVariable: '--font-space-mono',
      fallbacks: ['monospace'],
      name: 'Space Mono',
      provider: fontProviders.fontsource(),
      styles: ['normal'],
      subsets: ['latin'],
      weights: [400, 700],
    },
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: false, // issue with Tailwind v4 if enabled
  },
  integrations: [
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
    ssr: {
      external: ['@resvg/resvg-js'],
    },
  },
})
