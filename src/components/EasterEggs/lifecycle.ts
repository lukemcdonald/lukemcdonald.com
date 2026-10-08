import type { EasterEggMode } from './types'
import type { SoundName } from 'cuelume'

import { EASTER_EGG_DURATION_MS, EASTER_EGG_DURATION_REDUCED_MS } from './constants'

export function eggDurationMs(durationMs: number | undefined, reducedMotion: boolean): number {
  if (reducedMotion) {
    return EASTER_EGG_DURATION_REDUCED_MS
  }

  return durationMs ?? EASTER_EGG_DURATION_MS
}

export function eggSoundName(silent: boolean, sound: SoundName | undefined): SoundName | undefined {
  if (silent || !sound) {
    return undefined
  }

  return sound
}

export function shouldPersistEgg(mode: EasterEggMode): boolean {
  return mode === 'toggle'
}

export function shouldReplaceActiveEgg(activeId: string | undefined, nextId: string): boolean {
  return Boolean(activeId) && activeId !== nextId
}

export function shouldScheduleHide(mode: EasterEggMode): boolean {
  return mode === 'timed'
}
