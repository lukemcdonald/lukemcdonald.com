import type { ThemeColor } from './types'

export const THEME_COLORS: readonly ThemeColor[] = [
  'default',
  'blue',
  'emerald',
  'orange',
  'purple',
  'yellow',
] as const

export const DEFAULT_THEME_COLOR: ThemeColor = 'default'

export const THEME_COLOR_STORAGE_KEY = 'theme-color'

export const THEME_LABELS: Record<ThemeColor, string> = {
  blue: 'Blue',
  default: 'Default',
  emerald: 'Emerald',
  orange: 'Orange',
  purple: 'Purple',
  yellow: 'Yellow',
}
