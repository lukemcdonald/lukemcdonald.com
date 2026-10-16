import type { McpToolDeps } from './mcp.tools'

import { createMcpHandler, fromJsonSchema, McpServer } from '@modelcontextprotocol/server'

import {
  getContactResult,
  getPageResult,
  getResumeResult,
  getVerseResult,
  listPagesResult,
  loadVerseOrFallback,
  RESUME_SECTIONS,
} from './mcp.tools'

const READ_ONLY_SITE = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const

const READ_ONLY_VERSE = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
  readOnlyHint: true,
} as const

export const CORS_HEADERS = {
  'Access-Control-Allow-Headers':
    'Accept, Authorization, Content-Type, Last-Event-ID, MCP-Protocol-Version, MCP-Session-Id',
  'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, POST',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Expose-Headers':
    'Last-Event-ID, MCP-Protocol-Version, MCP-Session-Id, WWW-Authenticate',
  'Access-Control-Max-Age': '86400',
} as const

type McpFetchHandler = {
  fetch: (request: Request) => Promise<Response>
}

export function createSiteMcpHandler(deps: McpToolDeps) {
  return createMcpHandler(
    () => {
      const server = new McpServer({
        description:
          "Read-only tools for Luke McDonald's personal site. Use them to learn about Luke, his resume, published pages, contact details, and the verse of the day.",
        name: 'lukemcdonald.com',
        version: '1.0.0',
      })

      server.registerTool(
        'get_contact',
        {
          annotations: READ_ONLY_SITE,
          description:
            "Return Luke McDonald's contact details from the site author config (name, email, URL, and profiles).",
          title: 'Get contact',
        },
        () => {
          return getContactResult(deps.getContact())
        },
      )

      server.registerTool(
        'get_page',
        {
          annotations: READ_ONLY_SITE,
          description:
            'Return one published page (title, description, URL, and body text) by slug, path, or URL.',
          inputSchema: fromJsonSchema<{ slug: string }>({
            properties: {
              slug: {
                description: 'Page id, path, or URL, such as tread-talks or /i-am-a/christian',
                type: 'string',
              },
            },
            required: ['slug'],
            type: 'object',
          }),
          title: 'Get page',
        },
        async ({ slug }) => {
          const pages = await deps.getPublishedPages()

          return getPageResult(pages, slug, deps.origin)
        },
      )

      server.registerTool(
        'get_resume',
        {
          annotations: READ_ONLY_SITE,
          description:
            "Return Luke McDonald's resume as JSON. Omit section for the full resume. section matches /api/resume/[section].",
          inputSchema: fromJsonSchema<{ section?: string }>({
            properties: {
              section: {
                description: `Resume section: ${RESUME_SECTIONS.join(', ')}`,
                enum: [...RESUME_SECTIONS],
                type: 'string',
              },
            },
            type: 'object',
          }),
          title: 'Get resume',
        },
        async ({ section }) => {
          const data = await deps.getResumeData()

          return getResumeResult(data, section)
        },
      )

      server.registerTool(
        'get_verse_of_the_day',
        {
          annotations: READ_ONLY_VERSE,
          description:
            "Return today's Bible verse of the day. Falls back to Psalm 119:105 if the live lookup fails.",
          title: 'Get verse of the day',
        },
        async () => {
          const verse = await loadVerseOrFallback(deps.getTodayVerse)

          return getVerseResult(verse)
        },
      )

      server.registerTool(
        'list_pages',
        {
          annotations: READ_ONLY_SITE,
          description: 'List published pages with title, description, URL, and body text.',
          title: 'List pages',
        },
        async () => {
          const pages = await deps.getPublishedPages()

          return listPagesResult(pages, deps.origin)
        },
      )

      return server
    },
    { responseMode: 'json' },
  )
}

export async function handleMcpRequest(request: Request, mcpHandler: McpFetchHandler) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: CORS_HEADERS,
      status: 204,
    })
  }

  return withCors(await mcpHandler.fetch(request))
}

function withCors(response: Response) {
  const headers = new Headers(response.headers)

  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    headers.set(name, value)
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
