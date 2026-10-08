import { envField } from 'astro/config'

export const ENV_SCHEMA = {
  CONTEXT: envField.string({
    access: 'public',
    context: 'server',
    optional: true,
  }),
  GOOGLE_SITE_VERIFICATION: envField.string({
    access: 'public',
    context: 'client',
    optional: true,
  }),
  PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: envField.string({
    access: 'public',
    context: 'client',
    optional: true,
  }),
}
