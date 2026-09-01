import type { SoundPreference } from './types'

import { bind, play, setEnabled, setVolume } from 'cuelume'

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

  play('arrival')
}
