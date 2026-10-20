import type { ThemeMode } from './types'

export const THEME_MODES = ['light', 'dark', 'system'] as const satisfies readonly ThemeMode[]

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const MODE_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}
