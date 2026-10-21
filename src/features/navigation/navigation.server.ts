import type { NavigationGroup } from './navigation.types'

import { loadPublishedPages } from '@/features/pages/pages.server'

import { buildNavigationGroups } from './navigation.utils'

export async function loadNavigationGroups(
  options: { forMenu?: boolean } = {},
): Promise<NavigationGroup[]> {
  const pages = await loadPublishedPages({
    sortBy: 'order',
  })

  return buildNavigationGroups(pages, options)
}
