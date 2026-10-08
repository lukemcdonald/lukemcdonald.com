import type { SoundName } from 'cuelume'

export type EasterEggMode = 'timed' | 'toggle'

export type EasterEggTrigger = SequenceTrigger

export type PickStrategy = 'random' | 'schedule' | 'static'

export type Season = 'autumn' | 'spring' | 'summer' | 'winter'

export type SequenceTrigger = {
  codes: readonly [string, ...string[]]
  type: 'sequence'
}

export type CalendarDay = {
  day: number
  month: number
}

export type EasterEggSchedule =
  | { kind: 'month'; months: readonly number[] }
  | { end: CalendarDay; kind: 'range'; start: CalendarDay }
  | { kind: 'season'; seasons: readonly Season[] }

export type EasterEgg = {
  durationMs?: number
  id: string
  mode: EasterEggMode
  name: string
  onActivate?: () => void
  onDismiss?: () => void
  schedule?: EasterEggSchedule
  soundOff?: SoundName
  soundOn?: SoundName
  trigger: EasterEggTrigger
}

export type EasterEggConfig = {
  staticId: string
  strategy: PickStrategy
}

export type EasterEggKeyInput = {
  altKey: boolean
  code: string
  ctrlKey: boolean
  defaultPrevented: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  repeat: boolean
}

export type EasterEggTarget = {
  closestDialog: boolean
  isContentEditable: boolean
  tagName: string
}

export type StorageLike = {
  getItem: (key: string) => string | null
  key: (index: number) => string | null
  readonly length: number
  removeItem: (key: string) => void
  setItem: (key: string, value: string) => void
}
