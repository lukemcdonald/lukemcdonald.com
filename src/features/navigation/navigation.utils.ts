import type { MenuLinkItem, NavigationGroup } from './navigation.types'

export const PLAY_LINKS: MenuLinkItem[] = [{ href: '/tread-talks', name: 'TREAD Talks' }]

export const WORK_LINKS: MenuLinkItem[] = [{ href: '/resume', name: 'Resume' }]

export function toLiveLinks(pages: Array<{ data: { title: string }; id: string }>): MenuLinkItem[] {
  return pages.map((page) => {
    return {
      href: `/${page.id}`,
      name: page.data.title,
    }
  })
}

export function buildNavigationGroups(liveLinks: MenuLinkItem[]): NavigationGroup[] {
  return [
    { links: WORK_LINKS, name: 'Work' },
    { links: PLAY_LINKS, name: 'Play' },
    { links: liveLinks, name: 'Live' },
  ]
}
