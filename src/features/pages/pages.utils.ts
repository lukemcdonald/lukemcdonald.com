import type { PageEntry, PageSortOptions } from './pages.types'

export function sortByTitle(pages: PageEntry[]): PageEntry[] {
  return [...pages].sort((a, b) => a.data.title.localeCompare(b.data.title))
}

export function sortPages(pages: PageEntry[], options: PageSortOptions = {}): PageEntry[] {
  const { customSort, manualOrder, sortBy = 'title' } = options

  switch (sortBy) {
    case 'title':
      return sortByTitle(pages)
    case 'custom':
      if (!customSort) {
        throw new Error('Custom sort function is required when sortBy is "custom"')
      }

      return [...pages].sort(customSort)
    case 'manual':
      if (!manualOrder || manualOrder.length === 0) {
        throw new Error('Manual order array is required when sortBy is "manual"')
      }

      const orderMap = new Map(manualOrder.map((id, index) => [id, index]))

      return [...pages].sort((a, b) => {
        const indexA = orderMap.get(a.id)
        const indexB = orderMap.get(b.id)
        if (indexA !== undefined && indexB !== undefined) {
          return indexA - indexB
        }
        if (indexA !== undefined) return -1
        if (indexB !== undefined) return 1
        return a.data.title.localeCompare(b.data.title)
      })
    default:
      return pages
  }
}
