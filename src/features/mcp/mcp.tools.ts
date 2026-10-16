import type { JsonToolResult } from './mcp.utils'
import type { PageEntry } from '@/features/pages/pages.types'
import type { ResumeData } from '@/features/resume/resume.types'

import { z } from 'astro/zod'

import { GLOBAL_CONFIG } from '@/configs/global'
import { resolvePageSeo } from '@/features/pages/pages.utils'
import { resumeDataSchema } from '@/features/resume/resume.schema'
import { pickResumeSection } from '@/features/resume/resume.utils'
import { toPageHref } from '@/utils/content'

import { PAGE_SLUG_MAX } from './mcp.constants'
import { normalizePageId, toErrorResult, toJsonResult } from './mcp.utils'

export type McpToolDeps = {
  loadPublishedPages: () => Promise<readonly PageEntry[]>
  loadResumeData: () => Promise<ResumeData>
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

const getProfileTool: McpToolDefinition = {
  description:
    "Return Luke McDonald's profile: name, short summary, site URL, email, and social profiles.",
  handler: async (_args, deps) => {
    const pages = await deps.loadPublishedPages()
    const home = pages.find((page) => {
      return page.id === 'index'
    })
    const { email, name, profiles, url } = GLOBAL_CONFIG.author

    return toJsonResult({
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
}

const getResumeTool: McpToolDefinition = {
  description:
    "Return Luke McDonald's resume as JSON. Omit section for the full resume; section matches /api/resume/[section].",
  handler: async (args, deps) => {
    const data = await deps.loadResumeData()
    const section = typeof args.section === 'string' ? args.section : undefined

    if (!section) {
      return toJsonResult(data)
    }

    const payload = pickResumeSection(data, section)

    if (payload === null) {
      return toErrorResult(`Unknown resume section: ${section}`)
    }

    return toJsonResult(payload)
  },
  inputSchema: z.object({
    section: resumeDataSchema
      .keyof()
      .optional()
      .describe(`Resume section: ${resumeDataSchema.keyof().options.join(', ')}`),
  }),
  name: 'get_resume',
  title: 'Get resume',
}

const listPagesTool: McpToolDefinition = {
  description: 'List published pages with id, title, description, and URL.',
  handler: async (_args, deps) => {
    const pages = await deps.loadPublishedPages()

    return toJsonResult(
      pages.map((page) => {
        return {
          description: resolvePageSeo(page).description ?? '',
          id: page.id,
          title: page.data.title,
          url: toPageHref(page.id, GLOBAL_CONFIG.site.origin),
        }
      }),
    )
  },
  inputSchema: z.object({}),
  name: 'list_pages',
  title: 'List pages',
}

const getPageTool: McpToolDefinition = {
  description:
    "Return one published page's full content (title, description, URL, and body) by id, path, or URL.",
  handler: async (args, deps) => {
    const slug = typeof args.slug === 'string' ? args.slug : ''
    const pages = await deps.loadPublishedPages()
    const id = normalizePageId(slug)
    const page = pages.find((entry) => {
      return entry.id === id
    })

    if (!page) {
      return toErrorResult(`Unknown page: ${slug}`)
    }

    return toJsonResult({
      body: page.body?.trim() ?? '',
      description: resolvePageSeo(page).description ?? '',
      id: page.id,
      title: page.data.title,
      url: toPageHref(page.id, GLOBAL_CONFIG.site.origin),
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
}

export const MCP_TOOLS = [getProfileTool, getResumeTool, listPagesTool, getPageTool]
