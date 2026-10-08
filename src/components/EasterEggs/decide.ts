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

  return decideMatchedEggs(activeId, completed, pickOptions)
}

export function escapeDismissesEgg(mode: EasterEggMode | undefined): boolean {
  return mode === 'timed'
}

function completesActiveToggle(
  activeId: string | undefined,
  completed: readonly EasterEgg[],
): boolean {
  return completed.some((egg) => egg.id === activeId && egg.mode === 'toggle')
}

function decideChosenEgg(
  activeId: string | undefined,
  chosen: EasterEgg | undefined,
): CompletedEggDecision {
  if (!chosen) {
    return { kind: 'ignore' }
  }

  if (resolveEggActivation(activeId, chosen) === 'deactivate') {
    return { kind: 'deactivate' }
  }

  return { egg: chosen, kind: 'activate' }
}

function decideMatchedEggs(
  activeId: string | undefined,
  completed: readonly EasterEgg[],
  pickOptions: PickOptions,
): CompletedEggDecision {
  if (completesActiveToggle(activeId, completed)) {
    return { kind: 'deactivate' }
  }

  return decideChosenEgg(activeId, pickEgg(completed, pickOptions))
}
