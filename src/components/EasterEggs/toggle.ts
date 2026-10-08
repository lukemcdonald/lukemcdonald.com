import type { EasterEggMode } from './types'

export type EggActivation = 'activate' | 'deactivate' | 'replace'

export function resolveEggActivation(
  activeId: string | undefined,
  chosen: { id: string; mode: EasterEggMode },
): EggActivation {
  if (!activeId) {
    return 'activate'
  }

  if (activeId !== chosen.id) {
    return 'replace'
  }

  if (chosen.mode === 'toggle') {
    return 'deactivate'
  }

  return 'activate'
}
