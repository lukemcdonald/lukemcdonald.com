import type { CommandPaletteEggItem, CommandPaletteNavItem } from './types'
import type { ThemeColor } from '@/components/ThemeColor/types'
import type { ThemeMode } from '@/components/ThemeMode/types'

import { THEME_COLORS, THEME_LABELS } from '@/components/ThemeColor/constants'
import { MODE_LABELS, THEME_MODES } from '@/components/ThemeMode/constants'

const SOUND_LABELS = ['sound', 'sounds off', 'sounds on']

export const SECRETS_PAGE = 'secrets'
export const SECRETS_SHORTCUT_LABEL = '⌘.'

export type ApplyHighlightedCommandActions = {
  close: () => void
  navigate: (href: string) => void
  onPreferenceApplied: () => void
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleSound: () => void
}

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

export function applyHighlightedCommand(
  actions: ApplyHighlightedCommandActions,
  command: HighlightedCommand | undefined,
): void {
  if (!command) {
    return
  }

  if (command.type === 'nav') {
    actions.close()
    actions.navigate(command.href)
    return
  }

  if (command.type === 'color') {
    actions.setThemeColor(command.color)
    actions.onPreferenceApplied()
    return
  }

  if (command.type === 'mode') {
    actions.setThemeMode(command.mode)
    actions.onPreferenceApplied()
    return
  }

  actions.toggleSound()
  actions.onPreferenceApplied()
}

export function getFoundEggs(eggs: readonly CommandPaletteEggItem[], foundIds: readonly string[]) {
  return eggs.filter((egg) => foundIds.includes(egg.id))
}

export function getSecretsFooterLabel(foundCount: number, totalCount: number) {
  if (foundCount >= totalCount) {
    return 'All secrets found'
  }

  return `Secrets ${foundCount}/${totalCount}`
}

export function getSecretsProgressLabel(foundCount: number, totalCount: number) {
  if (foundCount >= totalCount) {
    return 'All secrets found'
  }

  return `Secrets: ${foundCount} of ${totalCount} found`
}

export function isPaletteBackKey(event: KeyboardEvent, search: string) {
  return event.key === 'Escape' || (event.key === 'Backspace' && !search)
}

export function isSecretsShortcut(event: KeyboardEvent) {
  return (event.ctrlKey || event.metaKey) && event.key === '.'
}
