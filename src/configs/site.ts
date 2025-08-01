const SITE_DOMAIN = 'lukemcdonald.com'
const SITE_URL = `https://${SITE_DOMAIN}`
const SITE_NAME = 'Luke McDonald'

export const SITE = {
  author: {
    name: SITE_NAME,
    url: SITE_URL,
  },
  dir: 'ltr',
  domain: SITE_DOMAIN,
  lang: 'en',
  name: SITE_NAME,
  themeColor: '#122023',
  timezone: 'America/Chicago',
  url: SITE_URL,
} as const
