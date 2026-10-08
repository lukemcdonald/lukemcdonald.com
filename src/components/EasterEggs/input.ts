import type { EasterEgg, EasterEggKeyInput, EasterEggTarget } from './types'

export type SequenceStep = {
  completed: boolean
  progress: number
}

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

export function collectCompletedSequenceEggs(
  eggs: readonly EasterEgg[],
  progressById: ReadonlyMap<string, number>,
  code: string,
): { completed: EasterEgg[]; progress: Map<string, number> } {
  const completed: EasterEgg[] = []
  const progress = new Map(progressById)

  for (const egg of eggs) {
    recordSequenceEgg(code, completed, egg, progress)
  }

  return { completed, progress }
}

export function stepSequence(
  progress: number,
  code: string,
  sequence: readonly string[],
): SequenceStep {
  const next = advanceSequenceProgress(progress, code, sequence)

  if (next >= sequence.length) {
    return { completed: true, progress: 0 }
  }

  return { completed: false, progress: next }
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

function recordSequenceEgg(
  code: string,
  completed: EasterEgg[],
  egg: EasterEgg,
  progress: Map<string, number>,
): void {
  const step = stepSequence(progress.get(egg.id) ?? 0, code, egg.trigger.codes)

  if (step.completed) {
    completed.push(egg)
    progress.delete(egg.id)
    return
  }

  writeSequenceProgress(egg.id, progress, step.progress)
}

function writeSequenceProgress(id: string, progress: Map<string, number>, next: number): void {
  if (next === 0) {
    progress.delete(id)
    return
  }

  progress.set(id, next)
}
