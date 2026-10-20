export type CommandPaletteEggItem = {
  id: string
  name: string
}

export type CommandPaletteNavGroup = {
  links: CommandPaletteNavItem[]
  name: string
}

export type CommandPaletteNavItem = {
  href: string
  name: string
}
