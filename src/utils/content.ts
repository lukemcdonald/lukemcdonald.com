/**
 * Remove known data file extensions from a content id
 * @param id - The content id to strip
 * @returns The content id without the `.yaml` extension
 */
export function stripDataExtension(id: string): string {
  return id.replace(/\.(ya?ml)$/i, '')
}

/**
 * Split a content id into section and nested itemId
 * @param id - The content id to parse
 * @returns The section, itemId, and whether it's a top-level entry
 */
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
