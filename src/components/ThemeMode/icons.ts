import type { ThemeMode } from './types'

import Moon from '@/components/Icons/Moon'
import Sun from '@/components/Icons/Sun'
import SunMoon from '@/components/Icons/SunMoon'

export const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: SunMoon,
}
