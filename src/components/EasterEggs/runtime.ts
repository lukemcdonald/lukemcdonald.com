import type { EasterEgg, EasterEggKeyInput, EasterEggTarget } from './types'

import { play } from 'cuelume'

import { EASTER_EGG_CONFIG } from './config'
import {
  EASTER_EGG_ATTRIBUTE,
  EASTER_EGG_DURATION_MS,
  EASTER_EGG_DURATION_REDUCED_MS,
  EASTER_EGG_IDLE_RESET_MS,
} from './constants'
import { advanceSequenceProgress, shouldIgnoreEasterEggInput } from './input'
import { clearStoredEasterEggs, getStoredEasterEggId, persistEasterEggId } from './persist'
import { pickEgg } from './pick'
import { EASTER_EGGS } from './registry'
import { resolveEggActivation } from './toggle'

let activeEgg: EasterEgg | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
const progressById = new Map<string, number>()
let started = false

function activateEgg(egg: EasterEgg, options: { silent?: boolean } = {}) {
  if (activeEgg && activeEgg.id !== egg.id) {
    dismissEgg({ silent: true })
  }

  clearHideTimer()
  activeEgg = egg
  document.documentElement.setAttribute(EASTER_EGG_ATTRIBUTE, egg.id)

  if (egg.mode === 'toggle') {
    writeStorage((storage) => persistEasterEggId(storage, egg.id))
  }

  if (egg.mode === 'timed') {
    const duration =
      prefersReducedMotion() ?
        EASTER_EGG_DURATION_REDUCED_MS
      : (egg.durationMs ?? EASTER_EGG_DURATION_MS)

    document.documentElement.style.setProperty('--easter-egg-duration', `${duration}ms`)
    hideTimer = setTimeout(() => {
      dismissEgg()
    }, duration)
  }

  egg.onActivate?.()

  if (!options.silent && egg.soundOn) {
    play(egg.soundOn)
  }
}

function clearHideTimer() {
  if (!hideTimer) {
    return
  }

  clearTimeout(hideTimer)
  hideTimer = null
}

function clearIdleTimer() {
  if (!idleTimer) {
    return
  }

  clearTimeout(idleTimer)
  idleTimer = null
}

function dismissEgg(options: { silent?: boolean } = {}) {
  const egg = activeEgg

  clearHideTimer()
  activeEgg = null
  document.documentElement.removeAttribute(EASTER_EGG_ATTRIBUTE)
  document.documentElement.style.removeProperty('--easter-egg-duration')
  writeStorage(clearStoredEasterEggs)
  egg?.onDismiss?.()

  if (!options.silent && egg?.soundOff) {
    play(egg.soundOff)
  }
}

function getEggTarget(target: EventTarget | null): EasterEggTarget | null {
  if (!(target instanceof Element)) {
    return null
  }

  return {
    closestDialog: target.closest('dialog, [role="dialog"]') !== null,
    isContentEditable: target.closest('[contenteditable]:not([contenteditable="false"])') !== null,
    tagName: target.closest('input, select, textarea')?.tagName ?? target.tagName,
  }
}

function onKeyDown(event: KeyboardEvent) {
  const input = toKeyInput(event)
  const target = getEggTarget(event.target)

  if (shouldIgnoreEasterEggInput(input, target)) {
    return
  }

  if (event.key === 'Escape') {
    progressById.clear()
    clearIdleTimer()

    if (activeEgg?.mode === 'timed') {
      dismissEgg()
    }

    return
  }

  if (activeEgg?.mode === 'timed') {
    return
  }

  const completed = takeCompletedEggs(event.code)

  if (completed.length === 0) {
    scheduleIdleReset()
    return
  }

  progressById.clear()
  clearIdleTimer()

  const chosen = pickEgg(completed, {
    date: new Date(),
    random: Math.random,
    staticId: EASTER_EGG_CONFIG.staticId,
    strategy: EASTER_EGG_CONFIG.strategy,
  })

  if (!chosen) {
    return
  }

  const action = resolveEggActivation(activeEgg?.id, chosen)

  if (action === 'deactivate') {
    dismissEgg()
    return
  }

  activateEgg(chosen)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function remountActiveEgg() {
  activeEgg?.onActivate?.()
}

function restoreStoredEgg() {
  const storage = readStorage()
  const storedId = storage ? getStoredEasterEggId(storage) : undefined
  const egg = EASTER_EGGS.find((item) => item.id === storedId)

  if (!egg) {
    document.documentElement.removeAttribute(EASTER_EGG_ATTRIBUTE)
    writeStorage(clearStoredEasterEggs)
    return
  }

  activateEgg(egg, { silent: true })
}

function readStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function scheduleIdleReset() {
  clearIdleTimer()
  idleTimer = setTimeout(() => {
    progressById.clear()
    idleTimer = null
  }, EASTER_EGG_IDLE_RESET_MS)
}

function sequenceEggs() {
  return EASTER_EGGS.filter((egg) => egg.trigger.type === 'sequence')
}

function takeCompletedEggs(code: string) {
  const completed: EasterEgg[] = []

  for (const egg of sequenceEggs()) {
    const next = advanceSequenceProgress(progressById.get(egg.id) ?? 0, code, egg.trigger.codes)

    if (next >= egg.trigger.codes.length) {
      progressById.delete(egg.id)
      completed.push(egg)
      continue
    }

    if (next === 0) {
      progressById.delete(egg.id)
    } else {
      progressById.set(egg.id, next)
    }
  }

  return completed
}

function toKeyInput(event: KeyboardEvent): EasterEggKeyInput {
  return {
    altKey: event.altKey,
    code: event.code,
    ctrlKey: event.ctrlKey,
    defaultPrevented: event.defaultPrevented,
    isComposing: event.isComposing,
    key: event.key,
    metaKey: event.metaKey,
    repeat: event.repeat,
  }
}

function writeStorage(write: (storage: Storage) => void) {
  const storage = readStorage()

  if (!storage) {
    return
  }

  write(storage)
}

/** Installs one document listener; later calls are no-ops across view transitions. */
export function initializeEasterEggs() {
  if (typeof window === 'undefined' || started) {
    return
  }

  started = true
  restoreStoredEgg()
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('astro:after-swap', remountActiveEgg)
}
