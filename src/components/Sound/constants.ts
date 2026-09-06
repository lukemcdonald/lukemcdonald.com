import type { SoundPreference } from './types'

export const SOUND_STORAGE_KEY = 'sound-enabled'

export const DEFAULT_SOUND_PREFERENCE: SoundPreference = 'off'

/**
 * Destination links. Cuelume hover is mouse-only; toggle follows native
 * click, so the same props work on hover, tap, and keyboard.
 */
export const LINK_CUE_PROPS = {
  'data-cuelume-hover': 'tick',
  'data-cuelume-toggle': true,
} as const

/** Quiet destination links (secondary / footer lists). */
export const SOFT_LINK_CUE_PROPS = {
  'data-cuelume-hover': 'whisper',
  'data-cuelume-toggle': true,
} as const

export const PRESS_CUE_PROPS = {
  'data-cuelume-press': true,
  'data-cuelume-release': true,
} as const

export const TOGGLE_CUE_PROPS = {
  'data-cuelume-toggle': true,
} as const
