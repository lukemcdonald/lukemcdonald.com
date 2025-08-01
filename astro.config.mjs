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
    responsiveStyles: true,
    layout: 'constrained',
  },
  integrations: [react(), sitemap()],
  site: SITE.url,
  vite: {
    // @ts-expect-error https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
  },
})
