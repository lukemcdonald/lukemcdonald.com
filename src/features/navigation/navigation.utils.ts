import type { MenuLinkItem, NavigationGroup } from './navigation.types'

export const RESUME_LINK: MenuLinkItem = { href: '/resume', name: 'Resume' }

type NavPage = {
  data: {
    navGroup?: 'live' | 'play' | 'work'
    title: string
  }
  id: string
}

function toPageLink(page: NavPage): MenuLinkItem {
  return {
    href: `/${page.id}`,
    name: page.data.title,
  }
}

function linksForNavGroup(pages: NavPage[], navGroup: 'live' | 'play' | 'work'): MenuLinkItem[] {
  return pages
    .filter((page) => {
      return page.data.navGroup === navGroup
    })
    .map(toPageLink)
}

export function buildNavigationGroups(pages: NavPage[]): NavigationGroup[] {
  return [
    { links: [RESUME_LINK, ...linksForNavGroup(pages, 'work')], name: 'Work' },
    { links: linksForNavGroup(pages, 'play'), name: 'Play' },
    { links: linksForNavGroup(pages, 'live'), name: 'Live' },
  ]
}

export function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

export function getExternalLinkAttrs(href: string): { rel?: string; target?: string } {
  if (!isExternalHref(href)) {
    return {}
  }

  return {
    rel: 'noopener noreferrer',
    target: '_blank',
  }
}

export function toHrefTestId(prefix: string, href: string): string {
  return `${prefix}-${toTestIdSlug(href) || 'home'}`
}

export function toNavMenuId(name: string): string {
  return `nav-menu-${toTestIdSlug(name)}`
}

export function toTestIdSlug(value: string): string {
  return value
    .trim()
    .replace(/^\//, '')
    .toLowerCase()
    .split('/')
    .map((segment) => {
      return segment.replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-+|-+$/g, '')
    })
    .filter((segment) => {
      return segment !== ''
    })
    .join('--')
}
