export type MenuLinkItem = {
  href: string
  name: string
}

export interface MenuLink extends MenuLinkItem {
  links?: MenuLinkItem[]
}

export type NavigationGroup = {
  links: MenuLinkItem[]
  name: string
}
