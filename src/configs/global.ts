import { z } from 'astro/zod'

const authorProfileSchema = z.object({
  network: z.string(),
  url: z.string(),
  username: z.string(),
})

export const authorSchema = z.object({
  email: z.string(),
  name: z.string(),
  profiles: z.array(authorProfileSchema),
  url: z.string(),
})

type Author = z.infer<typeof authorSchema>

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
  } satisfies Author,
  description:
    "I'm Luke, a Christian, husband, father and wrestling coach living in beautiful Eastern Iowa. My tent making is as a full-stack developer with an eye for design.",
  dir: 'ltr',
  lang: 'en',
  name: SITE_NAME,
  site: SITE_URLS,
  themeColor: '#122023',
  timezone: 'America/Chicago',
} as const
