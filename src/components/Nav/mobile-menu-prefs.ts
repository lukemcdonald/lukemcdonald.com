import type { SoundPreference } from '@/components/Sound/types'
import type { ThemeColor } from '@/components/ThemeColor/types'
import type { ThemeMode } from '@/components/ThemeMode/types'

import { setSoundPreference } from '@/components/Sound/utils'
import { THEME_COLORS } from '@/components/ThemeColor/constants'
import { setThemeColor } from '@/components/ThemeColor/utils'
import { THEME_MODES } from '@/components/ThemeMode/constants'
import { setThemeMode } from '@/components/ThemeMode/utils'

export function isThemeColor(value: string): value is ThemeColor {
  return (THEME_COLORS as readonly string[]).includes(value)
}

export function isThemeMode(value: string): value is ThemeMode {
  return (THEME_MODES as readonly string[]).includes(value)
}

export function applyThemeColorSelection(value: string): boolean {
  if (!isThemeColor(value)) {
    return false
  }

  setThemeColor(value)

  return true
}

export function applyThemeModeSelection(value: string): boolean {
  if (!isThemeMode(value)) {
    return false
  }

  setThemeMode(value)

  return true
}

export function applySoundSelection(checked: boolean): SoundPreference {
  const preference: SoundPreference = checked ? 'on' : 'off'

  setSoundPreference(preference)

  return preference
}
