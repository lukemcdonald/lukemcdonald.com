import type { ThemeMode } from './types'

import { Moon, Sun, SunMoon } from 'lucide-react'

export const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: SunMoon,
}
