import type { ResumeData } from '@/features/resume/resume.types'

import { z } from 'astro/zod'

import { pickResumeSection } from '@/features/resume/resume.utils'

const RESUME_SECTIONS = [
  'awards',
  'basics',
  'community',
  'education',
  'experience',
  'personal',
  'skills',
] as const

const PAGE_SLUG_MAX = 200

type McpAuthor = {
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
    seo?: {
      description?: string
    }
    title: string
  }
  id: string
}

export type McpToolDeps = {
  author: McpAuthor
  getPublishedPages: () => Promise<readonly McpPageEntry[]>
  getResumeData: () => Promise<ResumeData>
  origin: string
}

type JsonToolResult = {
  content: Array<{ text: string; type: 'text' }>
  isError?: boolean
}

type McpToolDefinition = {
  description: string
  handler: (
    args: Record<string, unknown>,
    deps: McpToolDeps,
  ) => JsonToolResult | Promise<JsonToolResult>
  inputSchema: z.ZodObject<z.ZodRawShape>
  name: string
  title: string
}

export const MCP_TOOLS: McpToolDefinition[] = [
  {
    description:
      "Return one published page's full content (title, description, URL, and body) by id, path, or URL.",
    handler: async (args, deps) => {
      const slug = typeof args.slug === 'string' ? args.slug : ''
      const pages = await deps.getPublishedPages()
      const id = normalizePageId(slug)
      const page = pages.find((entry) => {
        return entry.id === id
      })

      if (!page) {
        return errorResult(`Unknown page: ${slug}`)
      }

      return jsonResult({
        body: page.body?.trim() ?? '',
        description: pageDescription(page),
        id: page.id,
        title: page.data.title,
        url: pageUrl(page.id, deps.origin),
      })
    },
    inputSchema: z.object({
      slug: z
        .string()
        .trim()
        .min(1)
        .max(PAGE_SLUG_MAX)
        .describe('Page id, path, or URL, such as tread-talks or /i-am-a/christian'),
    }),
    name: 'get_page',
    title: 'Get page',
  },
  {
    description:
      "Return Luke McDonald's profile: name, short summary, site URL, email, and social profiles.",
    handler: async (_args, deps) => {
      const pages = await deps.getPublishedPages()
      const home = pages.find((page) => {
        return page.id === 'index'
      })
      const { email, name, profiles, url } = deps.author

      return jsonResult({
        email,
        name,
        profiles: [...profiles],
        summary: home ? pageDescription(home) : '',
        url,
      })
    },
    inputSchema: z.object({}),
    name: 'get_profile',
    title: 'Get profile',
  },
  {
    description:
      "Return Luke McDonald's resume as JSON. Omit section for the full resume; section matches /api/resume/[section].",
    handler: async (args, deps) => {
      const data = await deps.getResumeData()
      const section = typeof args.section === 'string' ? args.section : undefined

      if (!section) {
        return jsonResult(data)
      }

      const payload = pickResumeSection(data, section)

      if (payload === null) {
        return errorResult(`Unknown resume section: ${section}`)
      }

      return jsonResult(payload)
    },
    inputSchema: z.object({
      section: z
        .enum(RESUME_SECTIONS)
        .optional()
        .describe(`Resume section: ${RESUME_SECTIONS.join(', ')}`),
    }),
    name: 'get_resume',
    title: 'Get resume',
  },
  {
    description: 'List published pages with id, title, description, and URL.',
    handler: async (_args, deps) => {
      const pages = await deps.getPublishedPages()

      return jsonResult(
        pages.map((page) => {
          return {
            description: pageDescription(page),
            id: page.id,
            title: page.data.title,
            url: pageUrl(page.id, deps.origin),
          }
        }),
      )
    },
    inputSchema: z.object({}),
    name: 'list_pages',
    title: 'List pages',
  },
]

function errorResult(message: string): JsonToolResult {
  return {
    content: [{ text: message, type: 'text' }],
    isError: true,
  }
}

function jsonResult(data: unknown): JsonToolResult {
  return {
    content: [{ text: JSON.stringify(data, null, 2), type: 'text' }],
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

function pageDescription(page: McpPageEntry) {
  return page.data.seo?.description ?? page.data.description ?? ''
}

function pageUrl(id: string, origin: string) {
  const path = id === 'index' ? '/' : `/${id}`

  return new URL(path, origin).href
}
