import type { NavigationGroup } from './navigation.types'

import { getPublishedPages } from '@/features/pages/pages.server'

import { buildNavigationGroups } from './navigation.utils'

export async function getNavigationGroups(): Promise<NavigationGroup[]> {
  const pages = await getPublishedPages({
    sortBy: 'order',
  })

  return buildNavigationGroups(pages)
}
