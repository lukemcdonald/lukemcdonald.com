import type { MenuLinkItem, NavigationGroup } from './navigation.types'

export const RESUME_LINK: MenuLinkItem = { href: '/resume', name: 'Resume' }

type BuildNavigationOptions = {
  forMenu?: boolean
}

type NavPage = {
  data: {
    hideFromMenu?: boolean
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

function isVisibleInNav(page: NavPage, forMenu?: boolean) {
  return !forMenu || !page.data.hideFromMenu
}

function linksForNavGroup(
  pages: NavPage[],
  navGroup: 'live' | 'play' | 'work',
  forMenu?: boolean,
): MenuLinkItem[] {
  return pages
    .filter((page) => {
      return page.data.navGroup === navGroup
    })
    .filter((page) => {
      return isVisibleInNav(page, forMenu)
    })
    .map(toPageLink)
}

export function buildNavigationGroups(
  pages: NavPage[],
  options: BuildNavigationOptions = {},
): NavigationGroup[] {
  const { forMenu } = options

  return [
    { links: [RESUME_LINK, ...linksForNavGroup(pages, 'work', forMenu)], name: 'Work' },
    { links: linksForNavGroup(pages, 'play', forMenu), name: 'Play' },
    { links: linksForNavGroup(pages, 'live', forMenu), name: 'Live' },
  ]
}

export function isExternalHref(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

export function toExternalLinkAttrs(href: string): { rel?: string; target?: string } {
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

export function toPaletteNavGroupId(name: string): string {
  return `command-palette-nav-${toTestIdSlug(name)}`
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
