// Environment flags
export const IS_PROD = import.meta.env.PROD

const SITE_NAME = 'Luke McDonald'
const DOMAIN = 'lukemcdonald.com'

// Site URL configuration to match Astro.site structure
const SITE_URLS = {
  hostname: DOMAIN,
  href: `https://${DOMAIN}/`,
  origin: `https://${DOMAIN}`,
} as const

export const GLOBAL_CONFIG = {
  author: {
    name: SITE_NAME,
    url: SITE_URLS.origin,
  },
  dir: 'ltr',
  lang: 'en',
  name: SITE_NAME,
  site: SITE_URLS,
  // Default --color-primary-500 (narrow / entry header). Client JS replaces this.
  themeColor: '#abab9d',
  timezone: 'America/Chicago',
} as const
