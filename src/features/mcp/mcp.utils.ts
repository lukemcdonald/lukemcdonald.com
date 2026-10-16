import type { JsonToolResult, McpPageEntry } from './mcp.tools'

export function errorResult(message: string): JsonToolResult {
  return {
    content: [{ text: message, type: 'text' }],
    isError: true,
  }
}

export function jsonResult(data: unknown): JsonToolResult {
  return {
    content: [{ text: JSON.stringify(data, null, 2), type: 'text' }],
  }
}

export function normalizePageId(value: string) {
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

export function pageDescription(page: McpPageEntry) {
  return page.data.seo?.description ?? page.data.description ?? ''
}

export function pageHref(id: string, origin: string) {
  const path = id === 'index' ? '/' : `/${id}`

  return new URL(path, origin).href
}

export function toPagePayload(page: McpPageEntry, origin: string) {
  return {
    body: page.body?.trim() ?? '',
    description: pageDescription(page),
    id: page.id,
    title: page.data.title,
    url: pageHref(page.id, origin),
  }
}
