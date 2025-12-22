import type { ThemeColor } from './types'

export const THEME_COLORS: readonly ThemeColor[] = [
  'default',
  'blue',
  'green',
  'neon',
  'orange',
  'purple',
  'yellow',
] as const

export const DEFAULT_THEME_COLOR: ThemeColor = 'default'

export const THEME_LABELS: Record<ThemeColor, string> = {
  blue: 'Blue',
  default: 'Default',
  green: 'Green',
  neon: 'Neon',
  orange: 'Orange',
  purple: 'Purple',
  yellow: 'Yellow',
}

export const THEME_GRADIENTS: Record<ThemeColor, string> = {
  blue: 'linear-gradient(135deg, oklch(73.7% 0.055 250) 0%, oklch(32.7% 0.085 240) 100%)',
  default: 'linear-gradient(135deg, oklch(73.7% 0.019 106) 0%, oklch(32.7% 0.052 117) 100%)',
  green: 'linear-gradient(135deg, oklch(73.7% 0.08 128) 0%, oklch(32.7% 0.07 140) 100%)',
  neon: 'linear-gradient(135deg, oklch(93.27% 0.227 122.42) 0%, oklch(45.93% 0.112 130) 100%)',
  orange: 'linear-gradient(135deg, oklch(73.7% 0.08 44) 0%, oklch(32.7% 0.07 25) 100%)',
  purple: 'linear-gradient(135deg, oklch(73.7% 0.07 305) 0%, oklch(32.7% 0.085 320) 100%)',
  yellow: 'linear-gradient(135deg, oklch(73.7% 0.075 91) 0%, oklch(32.7% 0.065 80) 100%)',
}
