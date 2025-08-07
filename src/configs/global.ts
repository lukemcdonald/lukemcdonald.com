// Environment flags
export const IS_PROD = import.meta.env.PROD
export const IS_DEV = import.meta.env.DEV

const SITE_NAME = 'Luke McDonald'
const DOMAIN = 'lukemcdonald.com'

// Site URL configuration to match Astro.site structure
const SITE_URLS = {
  hostname: DOMAIN,
  href: `https://${DOMAIN}/`,
  origin: `https://${DOMAIN}`,
} as const

export const GLOBAL_CONFIG = {
  site: SITE_URLS,
  author: {
    name: SITE_NAME,
    url: SITE_URLS.origin,
  },
  dir: 'ltr',
  lang: 'en',
  name: SITE_NAME,
  themeColor: '#122023',
  timezone: 'America/Chicago',
} as const
