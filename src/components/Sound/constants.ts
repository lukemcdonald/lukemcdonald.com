import type { SoundPreference } from './types'

export const SOUND_STORAGE_KEY = 'sound-enabled'

export const DEFAULT_SOUND_PREFERENCE: SoundPreference = 'off'

export const HOVER_NAV_CUE_PROPS = {
  'data-cuelume-hover': 'tick',
} as const

export const PRESS_CUE_PROPS = {
  'data-cuelume-press': true,
  'data-cuelume-release': true,
} as const

export const TOGGLE_CUE_PROPS = {
  'data-cuelume-toggle': true,
} as const
