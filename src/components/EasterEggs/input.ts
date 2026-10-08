import type { EasterEggKeyInput, EasterEggTarget } from './types'

const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])

export function advanceSequenceProgress(
  progress: number,
  code: string,
  sequence: readonly string[],
): number {
  if (code === sequence[progress]) {
    return progress + 1
  }

  if (code === sequence[0]) {
    return 1
  }

  return 0
}

export function shouldIgnoreEasterEggInput(
  event: EasterEggKeyInput,
  target: EasterEggTarget | null,
): boolean {
  if (hasBlockingKeyFlags(event)) {
    return true
  }

  return Boolean(target && isTypingTarget(target))
}

function hasBlockingKeyFlags(event: EasterEggKeyInput): boolean {
  return [
    event.altKey,
    event.ctrlKey,
    event.defaultPrevented,
    event.isComposing,
    event.metaKey,
    event.repeat,
  ].some(Boolean)
}

function isTypingTarget(target: EasterEggTarget): boolean {
  return [target.closestDialog, target.isContentEditable, EDITABLE_TAGS.has(target.tagName)].some(
    Boolean,
  )
}
