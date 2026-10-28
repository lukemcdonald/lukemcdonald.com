import type { SoundPreference } from './types'
import type { SoundName } from 'cuelume'

import { SOUND_CONFIG } from '@/configs/sound'
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_SOUND_PREFERENCE } from './constants'

type Cuelume = typeof import('cuelume')

const CUE_SELECTOR =
  '[data-cuelume-hover], [data-cuelume-press], [data-cuelume-release], [data-cuelume-toggle]'

let cuelume: Cuelume | undefined
let cuelumePromise: Promise<Cuelume> | undefined
let listeningForFirstCue = false
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

  listenForFirstCue()
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

function disarmFirstCue() {
  if (!listeningForFirstCue) {
    return
  }

  listeningForFirstCue = false
  document.removeEventListener('pointerdown', onFirstCue, true)
  document.removeEventListener('pointerover', onFirstCue, true)
}

function getCueName(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return
  }

  const hover = target.closest('[data-cuelume-hover]')?.getAttribute('data-cuelume-hover')

  if (hover) {
    return hover
  }

  if (target.closest('[data-cuelume-toggle]')) {
    return 'toggle'
  }

  if (target.closest('[data-cuelume-press], [data-cuelume-release]')) {
    return 'tap'
  }
}

function isCueTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(CUE_SELECTOR))
}

function isSoundEnabled() {
  return SOUND_CONFIG.enableSounds && getSoundPreference() === 'on'
}

function listenForFirstCue() {
  if (listeningForFirstCue || started) {
    return
  }

  listeningForFirstCue = true
  document.addEventListener('pointerdown', onFirstCue, { capture: true })
  document.addEventListener('pointerover', onFirstCue, { capture: true })
}

function loadCuelume() {
  cuelumePromise ??= import('cuelume').then((mod) => {
    cuelume = mod
    return mod
  })

  return cuelumePromise
}

function onFirstCue(event: Event) {
  if (getSoundPreference() !== 'on' || !isCueTarget(event.target)) {
    return
  }

  const name = getCueName(event.target)

  disarmFirstCue()
  void startCuelume().then((mod) => {
    if (name) {
      mod.play(name as SoundName)
    }
  })
}

async function startCuelume() {
  disarmFirstCue()

  const mod = await loadCuelume()

  if (!started) {
    mod.bind()
    mod.setVolume(SOUND_CONFIG.volume)
    started = true
  }

  mod.setEnabled(isSoundEnabled())

  return mod
}
