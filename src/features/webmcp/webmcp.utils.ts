import type { MenuLinkItem } from '@/features/navigation/navigation.types'

import { toPagePath } from '@/utils/content'

export function toWebMcpPages(
  palettePages: readonly MenuLinkItem[],
  home?: { id: string },
): MenuLinkItem[] {
  if (!home) {
    return [...palettePages]
  }

  const homePage = { href: toPagePath(home.id), name: 'Home' }

  if (
    palettePages.some((page) => {
      return page.href === homePage.href
    })
  ) {
    return [...palettePages]
  }

  return [homePage, ...palettePages]
}
