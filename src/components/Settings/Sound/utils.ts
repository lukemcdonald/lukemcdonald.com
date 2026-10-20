import type { SoundPreference } from './types'
import type { SoundName } from 'cuelume'

import { SOUND_CONFIG } from '@/configs/sound'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_SOUND_PREFERENCE } from './constants'

type Cuelume = typeof import('cuelume')

let cuelume: Cuelume | undefined
let cuelumePromise: Promise<Cuelume> | undefined
let started = false

export function getSoundPreference(): SoundPreference {
  const stored = getStorageItem(STORAGE_KEYS.sound)

  if (stored === 'on' || stored === 'off') {
    return stored
  }

  return DEFAULT_SOUND_PREFERENCE
}

export function initializeSound(): void {
  if (typeof window === 'undefined' || !SOUND_CONFIG.enableSounds) {
    return
  }

  if (getSoundPreference() !== 'on') {
    return
  }

  void startCuelume()
}

export function playPageArrival(): void {
  playSound('navigate')
}

export function playSound(name: SoundName): void {
  if (typeof window === 'undefined' || !SOUND_CONFIG.enableSounds) {
    return
  }

  if (getSoundPreference() !== 'on') {
    return
  }

  void startCuelume().then(({ play }) => {
    play(name)
  })
}

export function setSoundPreference(enabled: boolean): SoundPreference {
  const next: SoundPreference = enabled ? 'on' : 'off'

  if (getSoundPreference() === next) {
    return next
  }

  setStorageItem(STORAGE_KEYS.sound, next)

  if (next === 'on') {
    void startCuelume().then(({ play }) => {
      play('toggle')
    })

    return next
  }

  if (cuelume && started) {
    cuelume.setEnabled(true)
    cuelume.play('toggle')
    cuelume.setEnabled(false)
  }

  return next
}

export function toggleSoundPreference(): SoundPreference {
  const enabled = getSoundPreference() !== 'on'

  return setSoundPreference(enabled)
}

function loadCuelume() {
  cuelumePromise ??= import('cuelume').then((mod) => {
    cuelume = mod
    return mod
  })

  return cuelumePromise
}

function isSoundEnabled() {
  return SOUND_CONFIG.enableSounds && getSoundPreference() === 'on'
}

async function startCuelume() {
  const mod = await loadCuelume()

  if (!started) {
    mod.bind()
    mod.setVolume(SOUND_CONFIG.volume)
    started = true
  }

  mod.setEnabled(isSoundEnabled())

  return mod
}
