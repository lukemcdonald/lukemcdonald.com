import type { ThemeMode } from './types'

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'] as const

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const MODE_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}
