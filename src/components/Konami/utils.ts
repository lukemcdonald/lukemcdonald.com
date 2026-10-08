import { KONAMI_SEQUENCE } from './constants'

export type KonamiAction = 'activate' | 'dismiss' | 'ignore' | 'progress'

export type KonamiKeyInput = {
  altKey: boolean
  code: string
  ctrlKey: boolean
  defaultPrevented: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  repeat: boolean
}

export type KonamiTarget = {
  closestDialog: boolean
  isContentEditable: boolean
  tagName: string
}

const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])

export function advanceKonamiProgress(
  progress: number,
  code: string,
  sequence: readonly string[] = KONAMI_SEQUENCE,
): number {
  if (code === sequence[progress]) {
    return progress + 1
  }

  if (code === sequence[0]) {
    return 1
  }

  return 0
}

export function interpretKonamiKey(
  event: KonamiKeyInput,
  target: KonamiTarget | null,
  state: { active: boolean; progress: number },
): { action: KonamiAction; progress: number } {
  if (shouldIgnoreKonamiInput(event, target)) {
    return { action: 'ignore', progress: state.progress }
  }

  if (event.key === 'Escape') {
    return interpretEscape(state.active)
  }

  if (state.active) {
    return { action: 'ignore', progress: state.progress }
  }

  return interpretSequence(state.progress, event.code)
}

export function shouldIgnoreKonamiInput(
  event: KonamiKeyInput,
  target: KonamiTarget | null,
): boolean {
  if (hasBlockingKeyFlags(event)) {
    return true
  }

  return Boolean(target && isTypingTarget(target))
}

function hasBlockingKeyFlags(event: KonamiKeyInput): boolean {
  return [
    event.altKey,
    event.ctrlKey,
    event.defaultPrevented,
    event.isComposing,
    event.metaKey,
    event.repeat,
  ].some(Boolean)
}

function interpretEscape(active: boolean): { action: KonamiAction; progress: number } {
  return {
    action: active ? 'dismiss' : 'ignore',
    progress: 0,
  }
}

function interpretSequence(
  progress: number,
  code: string,
): { action: KonamiAction; progress: number } {
  const next = advanceKonamiProgress(progress, code)
  const complete = next >= KONAMI_SEQUENCE.length

  return {
    action: complete ? 'activate' : 'progress',
    progress: complete ? 0 : next,
  }
}

function isTypingTarget(target: KonamiTarget): boolean {
  return [target.closestDialog, target.isContentEditable, EDITABLE_TAGS.has(target.tagName)].some(
    Boolean,
  )
}
