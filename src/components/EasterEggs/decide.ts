import type { PickOptions } from './pick'
import type { EasterEgg, EasterEggMode } from './types'

import { pickEgg } from './pick'
import { resolveEggActivation } from './toggle'

export type CompletedEggDecision =
  | { egg: EasterEgg; kind: 'activate' }
  | { kind: 'deactivate' }
  | { kind: 'idle' }
  | { kind: 'ignore' }

export function decideCompletedEggs(
  activeId: string | undefined,
  completed: readonly EasterEgg[],
  pickOptions: PickOptions,
): CompletedEggDecision {
  if (completed.length === 0) {
    return { kind: 'idle' }
  }

  const chosen = pickEgg(completed, pickOptions)

  if (!chosen) {
    return { kind: 'ignore' }
  }

  if (resolveEggActivation(activeId, chosen) === 'deactivate') {
    return { kind: 'deactivate' }
  }

  return { egg: chosen, kind: 'activate' }
}

export function escapeDismissesEgg(mode: EasterEggMode | undefined): boolean {
  return mode === 'timed'
}
