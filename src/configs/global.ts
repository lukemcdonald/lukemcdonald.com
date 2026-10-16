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
    email: 'thelukemcdonald@gmail.com',
    name: SITE_NAME,
    profiles: [
      { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
      {
        network: 'LinkedIn',
        url: 'https://www.linkedin.com/in/thelukemcdonald',
        username: 'thelukemcdonald',
      },
    ],
    url: SITE_URLS.origin,
  },
  dir: 'ltr',
  lang: 'en',
  name: SITE_NAME,
  site: SITE_URLS,
  themeColor: '#122023',
  timezone: 'America/Chicago',
} as const
