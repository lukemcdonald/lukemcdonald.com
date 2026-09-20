import type { ThemeMode } from './types'

import { Monitor, Moon, Sun } from 'lucide-react'

export const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
}
