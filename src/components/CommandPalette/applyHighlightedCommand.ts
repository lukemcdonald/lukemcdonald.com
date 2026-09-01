import type { HighlightedCommand } from './getHighlightedCommand'
import type { ThemeColor } from '@/components/ThemeColor/types'
import type { ThemeMode } from '@/components/ThemeMode/types'

export type ApplyHighlightedCommandActions = {
  close: () => void
  navigate: (href: string) => void
  onPreferenceApplied: () => void
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleSound: () => void
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
