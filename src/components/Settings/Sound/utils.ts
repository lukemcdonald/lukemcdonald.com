import type { SoundPreference } from './types'

import { bind, play, setEnabled, setVolume } from 'cuelume'

import { SOUND_CONFIG } from '@/configs/sound'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_SOUND_PREFERENCE } from './constants'

export function getSoundPreference(): SoundPreference {
  const stored = getStorageItem(STORAGE_KEYS.sound)

  if (stored === 'on' || stored === 'off') {
    return stored
  }

  return DEFAULT_SOUND_PREFERENCE
}

function setSoundPreference(preference: SoundPreference): void {
  setStorageItem(STORAGE_KEYS.sound, preference)
  setEnabled(preference === 'on')
}

export function toggleSoundPreference(): SoundPreference {
  const next: SoundPreference = getSoundPreference() === 'on' ? 'off' : 'on'

  if (next === 'off') {
    play('toggle')
    setSoundPreference(next)
  } else {
    setSoundPreference(next)
    play('toggle')
  }

  return next
}

export function initializeSound(): void {
  if (typeof window === 'undefined' || !SOUND_CONFIG.enableSounds) {
    return
  }

  bind()
  setEnabled(getSoundPreference() === 'on')
  setVolume(SOUND_CONFIG.volume)
}

export function playPageArrival(): void {
  if (typeof window === 'undefined' || !SOUND_CONFIG.enableSounds) {
    return
  }

  play('navigate')
}
