import type { ThemeColor } from './types'

export const THEME_COLORS = [
  'default',
  'blue',
  'emerald',
  'orange',
  'purple',
  'yellow',
] as const satisfies readonly ThemeColor[]

export const DEFAULT_THEME_COLOR: ThemeColor = 'default'

export const THEME_LABELS: Record<ThemeColor, string> = {
  blue: 'Blue',
  default: 'Default',
  emerald: 'Emerald',
  orange: 'Orange',
  purple: 'Purple',
  yellow: 'Yellow',
}
