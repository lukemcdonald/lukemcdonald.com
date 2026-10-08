import type { EasterEggKeyInput, EasterEggTarget } from './types'

const EDITABLE_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])

export function advanceSequenceProgress(
  progress: number,
  code: string,
  sequence: readonly string[],
): number {
  const attempted = sequence.slice(0, progress).concat(code)

  for (let length = Math.min(attempted.length, sequence.length); length > 0; length -= 1) {
    const suffix = attempted.slice(-length)

    if (suffix.every((item, index) => item === sequence[index])) {
      return length
    }
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
