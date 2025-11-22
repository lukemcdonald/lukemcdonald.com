// @ts-check
import netlify from '@astrojs/netlify'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import { defineConfig } from 'astro/config'

import { GLOBAL_CONFIG } from './src/configs/global.js'
import { ENV_SCHEMA } from './src/configs/env.js'

// Sitemap exclusions
const SITEMAP_EXCLUSIONS = new Set([`${GLOBAL_CONFIG.site.origin}/index`])

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  build: {
    format: 'directory',
  },
  env: {
    schema: ENV_SCHEMA,
  },
  experimental: {
    contentIntellisense: true,
    staticImportMetaEnv: true, // enabled by default in v6
  },
  image: {
    layout: 'constrained',
    responsiveStyles: false, // issue with Tailwind v4 if enabled
  },
  integrations: [
    react(),
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
  server: {
    port: 3000,
  },
  site: GLOBAL_CONFIG.site.origin,
  trailingSlash: 'never',
  vite: {
    plugins: [tailwindcss()],
  },
})
