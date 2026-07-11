import type { SoundPreference } from './types'

export const SOUND_STORAGE_KEY = 'sound-enabled'

export const DEFAULT_SOUND_PREFERENCE: SoundPreference = 'off'

// Shared data-cuelume-* attribute sets, so the cue mapping for a given
// kind of interaction lives in one place instead of being hand-copied
// at every call site.
export const PRESS_CUE_PROPS = {
  'data-cuelume-press': true,
  'data-cuelume-release': true,
} as const

export const TICK_CUE_PROPS = {
  'data-cuelume-hover': 'tick',
  'data-cuelume-press': true,
  'data-cuelume-release': true,
} as const
