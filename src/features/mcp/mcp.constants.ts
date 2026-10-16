import { GLOBAL_CONFIG } from '@/configs/global'

export const ALLOWED_METHODS = 'OPTIONS, POST'

export const CORS_HEADERS = {
  'Access-Control-Allow-Headers': 'Accept, Content-Type, MCP-Protocol-Version',
  'Access-Control-Allow-Methods': ALLOWED_METHODS,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Max-Age': '86400',
} as const

export const HANDLER_OPTIONS = {
  legacy: 'stateless',
  responseMode: 'json',
} as const

export const MCP_PATH = '/mcp'

export const MCP_URL = `${GLOBAL_CONFIG.site.origin}${MCP_PATH}`

export const PAGE_SLUG_MAX = 200

export const READ_ONLY = {
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
} as const

export const SERVER_INSTRUCTIONS = `${GLOBAL_CONFIG.name}'s personal site. Use get_profile for who Luke is and how to reach him, get_resume for his work history (optional section), list_pages to browse published pages, and get_page for one page's full content.`

export const SERVER_VERSION = '1.0.0'
