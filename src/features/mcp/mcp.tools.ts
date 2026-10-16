import type { ResumeData } from '@/features/resume/resume.types'
import type { Verse } from '@/features/verse/verse.types'

import { pickResumeSection } from '@/features/resume/resume.utils'
import { FALLBACK_VERSE } from '@/features/verse/verse.constants'

export const RESUME_SECTIONS = [
  'awards',
  'basics',
  'community',
  'education',
  'experience',
  'personal',
  'skills',
] as const

export type McpContact = {
  email: string
  name: string
  profiles: ReadonlyArray<{
    network: string
    url: string
    username: string
  }>
  url: string
}

export type McpPageEntry = {
  body?: string
  data: {
    description?: string
    title: string
  }
  id: string
}

export type McpToolDeps = {
  getContact: () => McpContact
  getPublishedPages: () => Promise<readonly McpPageEntry[]>
  getResumeData: () => Promise<ResumeData>
  getTodayVerse: () => Promise<Verse>
  origin: string
}

type ToolTextResult = {
  content: Array<{ text: string; type: 'text' }>
  isError?: boolean
}

export function getContactResult(contact: McpContact) {
  return jsonResult({
    email: contact.email,
    name: contact.name,
    profiles: [...contact.profiles],
    url: contact.url,
  })
}

export function getPageResult(pages: readonly McpPageEntry[], slug: string, origin: string) {
  const id = normalizePageId(slug)
  const page = pages.find((entry) => {
    return entry.id === id
  })

  if (!page) {
    return errorResult(`Unknown page: ${slug}`)
  }

  return jsonResult(toPagePayload(page, origin))
}

export function getResumeResult(data: ResumeData, section?: string) {
  if (!section) {
    return jsonResult(data)
  }

  const payload = pickResumeSection(data, section)

  if (payload === null) {
    return errorResult(
      `Unknown resume section: ${section}. Valid sections: ${RESUME_SECTIONS.join(', ')}`,
    )
  }

  return jsonResult(payload)
}

export function getVerseResult(verse: Verse) {
  return jsonResult(verse)
}

export function listPagesResult(pages: readonly McpPageEntry[], origin: string) {
  return jsonResult(
    pages.map((page) => {
      return toPagePayload(page, origin)
    }),
  )
}

export async function loadVerseOrFallback(load: () => Promise<Verse>) {
  try {
    return await load()
  } catch {
    return FALLBACK_VERSE
  }
}

function normalizePageId(value: string) {
  const trimmed = value.trim()
  let path = trimmed

  try {
    path = new URL(trimmed).pathname
  } catch {
    // Keep relative slugs and paths as written.
  }

  const id = path.replace(/^\/+|\/+$/g, '')

  if (id === '' || id === 'index') {
    return 'index'
  }

  return id
}

function errorResult(message: string): ToolTextResult {
  return {
    content: [{ text: message, type: 'text' }],
    isError: true,
  }
}

function jsonResult(data: unknown): ToolTextResult {
  return {
    content: [{ text: JSON.stringify(data, null, 2), type: 'text' }],
  }
}

function pageHref(id: string, origin: string) {
  const path = id === 'index' ? '/' : `/${id}`

  return new URL(path, origin).href
}

function toPagePayload(page: McpPageEntry, origin: string) {
  return {
    body: page.body?.trim() ?? '',
    description: page.data.description ?? '',
    id: page.id,
    title: page.data.title,
    url: pageHref(page.id, origin),
  }
}
