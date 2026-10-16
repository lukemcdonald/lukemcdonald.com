import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'

import { MCP_TOOLS, type McpToolDeps } from './mcp.tools'

const READ_ONLY = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const

const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Accept, Content-Type, MCP-Protocol-Version',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Max-Age': '86400',
} as const

const ALLOWED_METHODS = 'OPTIONS, POST'

type McpFetchHandler = {
  fetch: (request: Request) => Promise<Response>
}

export function createSiteMcpHandler(deps: McpToolDeps) {
  return createMcpHandler(
    () => {
      const server = new McpServer(
        {
          name: 'lukemcdonald.com',
          version: '1.0.0',
        },
        {
          instructions:
            "Luke McDonald's personal site. Use get_profile for who Luke is and how to reach him, get_resume for his work history (optional section), list_pages to browse published pages, and get_page for one page's full content.",
        },
      )

      for (const { description, handler, inputSchema, name, title } of MCP_TOOLS) {
        server.registerTool(
          name,
          {
            annotations: READ_ONLY,
            description,
            inputSchema,
            title,
          },
          (args) => {
            return handler(args as Record<string, unknown>, deps)
          },
        )
      }

      return server
    },
    {
      legacy: 'stateless',
      responseMode: 'json',
    },
  )
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

export async function handleMcpRequest(request: Request, mcpHandler: McpFetchHandler) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: CORS_HEADERS,
      status: 204,
    })
  }

  if (request.method !== 'POST') {
    return new Response(null, {
      headers: {
        ...CORS_HEADERS,
        Allow: ALLOWED_METHODS,
      },
      status: 405,
    })
  }

  return withCors(await mcpHandler.fetch(request))
}
