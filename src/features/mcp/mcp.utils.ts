export type JsonToolResult = {
  content: Array<{ text: string; type: 'text' }>
  isError?: boolean
}

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
