export const SOUND_CONFIG = {
  // Master build-time switch, independent of any visitor's stored preference
  enableSounds: true,
} as const

export type SoundConfig = typeof SOUND_CONFIG
