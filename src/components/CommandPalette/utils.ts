import type { CommandPaletteEggItem, CommandPaletteNavItem } from './types'
import type { ThemeColor } from '@/components/ThemeColor/types'
import type { ThemeMode } from '@/components/ThemeMode/types'

import { THEME_COLORS, THEME_LABELS } from '@/components/ThemeColor/constants'
import { MODE_LABELS, THEME_MODES } from '@/components/ThemeMode/constants'

const SOUND_LABELS = ['sound', 'sounds off', 'sounds on']

export type ApplyHighlightedCommandActions = {
  close: () => void
  navigate: (href: string) => void
  onPreferenceApplied: () => void
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleEgg: (id: string) => void
  toggleSound: () => void
}

export type HighlightedCommand =
  | { color: ThemeColor; type: 'color' }
  | { eggId: string; type: 'egg' }
  | { href: string; type: 'nav' }
  | { mode: ThemeMode; type: 'mode' }
  | { type: 'sound' }

export function getHighlightedCommand(
  navItems: CommandPaletteNavItem[],
  query: string,
  foundEggs: readonly CommandPaletteEggItem[] = [],
): HighlightedCommand | undefined {
  const needle = query.trim().toLowerCase()

  if (needle === '') {
    return undefined
  }

  const navItem = navItems.find((item) => item.name.toLowerCase().includes(needle))

  if (navItem) {
    return { href: navItem.href, type: 'nav' }
  }

  const egg = foundEggs.find((item) => item.name.toLowerCase().includes(needle))

  if (egg) {
    return { eggId: egg.id, type: 'egg' }
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

  if (command.type === 'egg') {
    actions.toggleEgg(command.eggId)
    actions.onPreferenceApplied()
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

export function getSecretsProgressLabel(foundCount: number, totalCount: number) {
  if (foundCount >= totalCount) {
    return 'All secrets found'
  }

  return `Secrets: ${foundCount} of ${totalCount} found`
}

export function getVisibleSecrets(
  eggs: readonly CommandPaletteEggItem[],
  foundIds: readonly string[],
  query: string,
) {
  const foundEggs = eggs.filter((egg) => foundIds.includes(egg.id))
  const needle = query.trim().toLowerCase()
  const progressLabel = getSecretsProgressLabel(foundEggs.length, eggs.length)
  const showProgress = needle === '' || progressLabel.toLowerCase().includes(needle)
  const visibleFoundEggs =
    needle === '' ? foundEggs : foundEggs.filter((egg) => egg.name.toLowerCase().includes(needle))

  return {
    foundEggs,
    progressLabel,
    showProgress,
    showSecrets: showProgress || visibleFoundEggs.length > 0,
    visibleFoundEggs,
  }
}
