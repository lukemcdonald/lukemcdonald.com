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

// Swatches preview each theme's --color-primary-400/800 (defined once in
// theme.css) by scoping a `data-theme` attribute locally rather than
// duplicating the oklch values here — see the comment above the
// `[data-theme]` rules in theme.css.
export const SWATCH_LIGHT_VAR = 'var(--color-primary-400)'
export const SWATCH_DARK_VAR = 'var(--color-primary-800)'
