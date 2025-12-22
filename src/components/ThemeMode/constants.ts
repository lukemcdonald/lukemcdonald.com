import type { ThemeMode } from './types'

import Moon from '@/components/Icons/Moon'
import Sun from '@/components/Icons/Sun'
import SunMoon from '@/components/Icons/SunMoon'

export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'] as const

export const DEFAULT_THEME_MODE: ThemeMode = 'system'

export const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: SunMoon,
}

export const MODE_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
}
