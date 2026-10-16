import type { JsonToolResult } from './mcp.utils'
import type { PageEntry } from '@/features/pages/pages.types'
import type { ResumeData } from '@/features/resume/resume.types'

import { z } from 'astro/zod'

import { GLOBAL_CONFIG } from '@/configs/global'
import { resolvePageSeo } from '@/features/pages/pages.utils'
import { resumeDataSchema } from '@/features/resume/resume.schema'
import { pickResumeSection } from '@/features/resume/resume.utils'
import { pageHref } from '@/utils/content'

import { PAGE_SLUG_MAX } from './mcp.constants'
import { errorResult, jsonResult, normalizePageId } from './mcp.utils'

export type McpToolDeps = {
  getPublishedPages: () => Promise<readonly PageEntry[]>
  getResumeData: () => Promise<ResumeData>
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
        description: resolvePageSeo(page).description ?? '',
        id: page.id,
        title: page.data.title,
        url: pageHref(page.id, GLOBAL_CONFIG.site.origin),
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
      const { email, name, profiles, url } = GLOBAL_CONFIG.author

      return jsonResult({
        email,
        name,
        profiles: [...profiles],
        summary: home ? (resolvePageSeo(home).description ?? '') : '',
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
      section: resumeDataSchema
        .keyof()
        .optional()
        .describe(`Resume section: ${resumeDataSchema.keyof().options.join(', ')}`),
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
            description: resolvePageSeo(page).description ?? '',
            id: page.id,
            title: page.data.title,
            url: pageHref(page.id, GLOBAL_CONFIG.site.origin),
          }
        }),
      )
    },
    inputSchema: z.object({}),
    name: 'list_pages',
    title: 'List pages',
  },
]
