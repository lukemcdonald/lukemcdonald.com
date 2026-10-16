import { createMcpHandler, McpServer } from '@modelcontextprotocol/server'

import { GLOBAL_CONFIG } from '@/configs/global'

import {
  ALLOWED_METHODS,
  CORS_HEADERS,
  HANDLER_OPTIONS,
  READ_ONLY,
  SERVER_INSTRUCTIONS,
  SERVER_VERSION,
} from './mcp.constants'
import { MCP_TOOLS, type McpToolDeps } from './mcp.tools'

type McpFetchHandler = {
  fetch: (request: Request) => Promise<Response>
}

export function createSiteMcpHandler(deps: McpToolDeps) {
  return createMcpHandler(() => {
    const server = new McpServer(
      {
        name: GLOBAL_CONFIG.site.hostname,
        version: SERVER_VERSION,
      },
      {
        instructions: SERVER_INSTRUCTIONS,
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
  }, HANDLER_OPTIONS)
}

function createCorsResponse(response: Response) {
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

  return createCorsResponse(await mcpHandler.fetch(request))
}
