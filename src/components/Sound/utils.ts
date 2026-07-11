import type { SoundPreference } from './types'

import { bind, setEnabled } from 'cuelume'

import { SOUND_CONFIG } from '@/configs/sound'

import { DEFAULT_SOUND_PREFERENCE, SOUND_STORAGE_KEY } from './constants'

export function getSoundPreference(): SoundPreference {
  if (typeof window === 'undefined') {
    return DEFAULT_SOUND_PREFERENCE
  }

  const stored = localStorage.getItem(SOUND_STORAGE_KEY)

  if (stored === 'on' || stored === 'off') {
    return stored
  }

  return DEFAULT_SOUND_PREFERENCE
}

export function setSoundPreference(preference: SoundPreference): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(SOUND_STORAGE_KEY, preference)
  setEnabled(preference === 'on')
}

export function initializeSound(): void {
  if (typeof window === 'undefined' || !SOUND_CONFIG.enableSounds) {
    return
  }

  setEnabled(getSoundPreference() === 'on')
  bind(document)
}
