import type { NavigationGroup } from './navigation.types'

import { getPublishedPages } from '@/features/pages/pages.server'

import { buildNavigationGroups, toLiveLinks } from './navigation.utils'

export async function getNavigationGroups(): Promise<NavigationGroup[]> {
  const livePages = await getPublishedPages({
    include: ['i-am-a'],
    sortBy: 'order',
  })

  return buildNavigationGroups(toLiveLinks(livePages))
}
