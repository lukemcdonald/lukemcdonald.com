import { isGlassLevel, setGlassLevel } from '@/components/Glass/utils'
import { toggleSoundPreference } from '@/components/Sound/utils'
import { isThemeColor, setThemeColor } from '@/components/ThemeColor/utils'
import { isThemeMode, setThemeMode } from '@/components/ThemeMode/utils'

export function applyGlassSelection(value: string): boolean {
  if (!isGlassLevel(value)) {
    return false
  }

  setGlassLevel(value)

  return true
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

export function applySoundToggle() {
  return toggleSoundPreference()
}

export function applyPreference(kind: string | null, value: string): boolean {
  if (kind === 'color') {
    return applyThemeColorSelection(value)
  }

  if (kind === 'glass') {
    return applyGlassSelection(value)
  }

  if (kind === 'mode') {
    return applyThemeModeSelection(value)
  }

  return false
}
