import { GLOBAL_CONFIG } from '@/configs/global'
import { stripHtmlAndTruncate } from '@/utils/text'

type LlmsLink = {
  href: string
  notes?: string
  title: string
}

type LlmsPage = {
  data: {
    description?: string
    seo?: {
      description?: string
    }
    title: string
  }
  id: string
}

type LlmsBasics = {
  intro?: string
  label?: string
}

type LlmsResume = {
  basics: LlmsBasics
}

function toAbsoluteUrl(path: string, origin: string | URL) {
  return new URL(path, origin).href
}

function toTitleCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}

function notesFrom(value?: string) {
  return stripHtmlAndTruncate(value) || undefined
}

function formatLink({ href, notes, title }: LlmsLink) {
  if (!notes) {
    return `- [${title}](${href})`
  }

  return `- [${title}](${href}): ${notes}`
}

function formatSection(title: string, links: LlmsLink[]) {
  return `## ${title}\n\n${links.map(formatLink).join('\n')}`
}

function pagePath(id: string) {
  if (id === 'index') {
    return '/'
  }

  return `/${id}`
}

function resolveSummary(pages: LlmsPage[], resume: LlmsResume) {
  const home = pages.find((page) => {
    return page.id === 'index'
  })

  return (
    notesFrom(home?.data.seo?.description) ||
    notesFrom(home?.data.description) ||
    notesFrom(resume.basics.intro) ||
    ''
  )
}

function pageLinks(pages: LlmsPage[], resume: LlmsResume, origin: string | URL): LlmsLink[] {
  return [
    {
      href: toAbsoluteUrl('/', origin),
      title: 'Home',
    },
    {
      href: toAbsoluteUrl('/resume', origin),
      notes: resume.basics.label,
      title: 'Resume',
    },
    ...pages
      .filter((page) => {
        return page.id !== 'index'
      })
      .map((page) => {
        return {
          href: toAbsoluteUrl(pagePath(page.id), origin),
          notes: notesFrom(page.data.description),
          title: page.data.title,
        }
      }),
  ]
}

function resumeLinks(resume: LlmsResume, origin: string | URL): LlmsLink[] {
  return [
    {
      href: toAbsoluteUrl('/api/resume.json', origin),
      title: 'Full resume',
    },
    ...Object.keys(resume)
      .sort((left, right) => {
        return left.localeCompare(right)
      })
      .map((section) => {
        return {
          href: toAbsoluteUrl(`/api/resume/${section}.json`, origin),
          title: toTitleCase(section),
        }
      }),
  ]
}

function contactLinks(): LlmsLink[] {
  const { email, profiles } = GLOBAL_CONFIG.author

  return [
    {
      href: `mailto:${email}`,
      title: 'Email',
    },
    ...profiles.map((profile) => {
      return {
        href: profile.url,
        title: profile.network,
      }
    }),
  ]
}

export function createLlmsTxt<T extends LlmsResume>({
  name,
  origin,
  pages,
  resume,
}: {
  name: string
  origin: string | URL
  pages: LlmsPage[]
  resume: T
}) {
  const summary = resolveSummary(pages, resume)
  const parts = [`# ${name}`]

  if (summary) {
    parts.push(`> ${summary}`)
  }

  parts.push(
    formatSection('Pages', pageLinks(pages, resume, origin)),
    formatSection('Resume', resumeLinks(resume, origin)),
    formatSection('Contact', contactLinks()),
  )

  return `${parts.join('\n\n')}\n`
}
