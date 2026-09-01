import type { CommandPaletteNavItem } from './types'
import type { ThemeColor } from '@/components/ThemeColor/types'
import type { ThemeMode } from '@/components/ThemeMode/types'

import { THEME_COLORS, THEME_LABELS } from '@/components/ThemeColor/constants'
import { MODE_LABELS, THEME_MODES } from '@/components/ThemeMode/constants'

const SOUND_LABELS = ['sound', 'sounds off', 'sounds on']

export type HighlightedCommand =
  | { color: ThemeColor; type: 'color' }
  | { href: string; type: 'nav' }
  | { mode: ThemeMode; type: 'mode' }
  | { type: 'sound' }

export function getHighlightedCommand(
  navItems: CommandPaletteNavItem[],
  query: string,
): HighlightedCommand | undefined {
  const needle = query.trim().toLowerCase()

  if (needle === '') {
    return undefined
  }

  const navItem = navItems.find((item) => item.name.toLowerCase().includes(needle))

  if (navItem) {
    return { href: navItem.href, type: 'nav' }
  }

  const color = THEME_COLORS.find((item) => THEME_LABELS[item].toLowerCase().includes(needle))

  if (color) {
    return { color, type: 'color' }
  }

  const mode = THEME_MODES.find((item) => MODE_LABELS[item].toLowerCase().includes(needle))

  if (mode) {
    return { mode, type: 'mode' }
  }

  const soundMatch = SOUND_LABELS.some((label) => label.includes(needle))

  if (soundMatch) {
    return { type: 'sound' }
  }

  return undefined
}
