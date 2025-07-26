// @ts-check
import { defineConfig, envField } from "astro/config";

import react from '@astrojs/react';

import netlify from '@astrojs/netlify';

import { SITE } from './src/config.js';

import tailwindcss from "@tailwindcss/vite";

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

  integrations: [react()],
  site: SITE.url,

  vite: {
    // @ts-expect-error https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
  },
})
