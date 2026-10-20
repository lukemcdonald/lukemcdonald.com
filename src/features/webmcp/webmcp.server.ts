import { buildNavigationGroups } from '@/features/navigation/navigation.utils'
import { loadPublishedPages } from '@/features/pages/pages.server'

import { toHomePage, toWebMcpPages } from './webmcp.utils'

export async function loadWebMcpPages() {
  const pages = await loadPublishedPages({
    sortBy: 'order',
  })
  const palettePages = buildNavigationGroups(pages).flatMap((group) => {
    return group.links
  })
  const home = pages.find((page) => {
    return page.id === 'index'
  })

  if (!home) {
    return palettePages
  }

  return toWebMcpPages(palettePages, toHomePage(home))
}
