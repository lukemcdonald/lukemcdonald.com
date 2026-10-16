function stripDataExtension(id: string): string {
  return id.replace(/\.(ya?ml)$/i, '')
}

export function parseContentId(id: string): {
  isTopLevel: boolean
  itemId: string
  section: string
} {
  const base = stripDataExtension(id)
  const parts = base.split('/')
  const section = parts[0] || ''
  const itemId = parts.slice(1).join('/')

  return {
    isTopLevel: parts.length === 1,
    itemId,
    section,
  }
}
