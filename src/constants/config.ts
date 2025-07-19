const domain = 'lukemcdonald.com'
const url = `https://${domain}`
const name = 'Luke McDonald'

export const SITE = {
  author: {
    name,
    url,
  },
  name,
  domain,
  url,
  dir: 'ltr',
  themeColor: '#122023',
  lang: 'en',
  timezone: 'America/Chicago',
} as const
