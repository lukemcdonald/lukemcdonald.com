// @ts-check
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";

import { defineConfig, envField } from "astro/config";

import { SITE } from './src/configs/site.js';

// https://astro.build/config
export default defineConfig({
  adapter: netlify(),
  build: {
    format: 'file',
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: 'public',
        context: 'client',
        optional: true,
      }),
    },
  },
  image: {
    layout: 'constrained',
    responsiveStyles: false, // issue with Tailwind v4 if enabled
  },
  integrations: [react(), sitemap()],
  site: SITE.url,
  trailingSlash: 'never',
  vite: {
    // @ts-expect-error https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
  },
})
