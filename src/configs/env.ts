import { envField } from 'astro/config'

export const ENV_SCHEMA = {
  POSTHOG_API_KEY: envField.string({
    access: 'public',
    context: 'client',
    default: 'phc_uOQ6lcaumKxM0PL2tuStM1uioEePx2JfFB7680cpHQF',
  }),
  PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
    access: 'public',
    context: 'client',
    optional: true,
  }),
}
