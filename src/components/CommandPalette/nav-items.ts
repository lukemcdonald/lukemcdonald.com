import type { CommandPaletteNavItem } from './types'
import type { NavigationGroup } from '@/features/navigation/navigation.types'

export function toCommandPaletteNavItems(groups: NavigationGroup[]): CommandPaletteNavItem[] {
  return groups.flatMap((group) => group.links)
}
