import type { BasicsItem } from '@/features/resume/resume.types'

export function contactLinksFromBasics(basics: unknown) {
  const links: Array<{ href: string; name: string }> = []

  if (!basics || typeof basics !== 'object' || Array.isArray(basics)) {
    return links
  }

  const { email, profiles } = basics as Pick<BasicsItem, 'email' | 'profiles'>

  if (email) {
    links.push({ href: `mailto:${email}`, name: 'Email' })
  }

  for (const profile of profiles ?? []) {
    links.push({ href: profile.url, name: profile.network })
  }

  return links
}
