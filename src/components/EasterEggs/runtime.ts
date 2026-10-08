import type { CompletedEggDecision } from './decide'
import type { EasterEgg, EasterEggKeyInput, EasterEggTarget } from './types'
import type { SoundName } from 'cuelume'

import { play } from 'cuelume'

import { EASTER_EGG_CONFIG } from './config'
import { EASTER_EGG_ATTRIBUTE, EASTER_EGG_IDLE_RESET_MS } from './constants'
import { decideCompletedEggs, escapeDismissesEgg } from './decide'
import { collectCompletedSequenceEggs, shouldIgnoreEasterEggInput } from './input'
import {
  eggDurationMs,
  eggSoundName,
  shouldPersistEgg,
  shouldReplaceActiveEgg,
  shouldScheduleHide,
} from './lifecycle'
import { clearStoredEasterEggs, getStoredEasterEggId, persistEasterEggId } from './persist'
import { EASTER_EGGS } from './registry'

let activeEgg: EasterEgg | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let progressById = new Map<string, number>()
let started = false

function activateEgg(egg: EasterEgg, options: { silent?: boolean } = {}) {
  dismissIfReplacing(egg)
  presentEgg(egg)
  playNamedSound(eggSoundName(Boolean(options.silent), egg.soundOn))
}

function applyCompletedDecision(decision: CompletedEggDecision) {
  if (decision.kind === 'deactivate') {
    dismissEgg()
    return
  }

  if (decision.kind === 'activate') {
    activateEgg(decision.egg)
  }
}

function applySequenceKey(code: string) {
  if (isTimedActive()) {
    return
  }

  settleSequenceKey(code)
}

function currentPickOptions() {
  return {
    date: new Date(),
    random: Math.random,
    staticId: EASTER_EGG_CONFIG.staticId,
    strategy: EASTER_EGG_CONFIG.strategy,
  }
}

function isTimedActive() {
  return activeEgg?.mode === 'timed'
}

function settleSequenceDecision(decision: CompletedEggDecision) {
  if (decision.kind === 'idle') {
    scheduleIdleReset()
    return
  }

  resetProgress()
  applyCompletedDecision(decision)
}

function settleSequenceKey(code: string) {
  const stepped = collectCompletedSequenceEggs(sequenceEggs(), progressById, code)
  progressById = stepped.progress
  settleSequenceDecision(
    decideCompletedEggs(activeEgg?.id, stepped.completed, currentPickOptions()),
  )
}

function armTimedEgg(egg: EasterEgg) {
  if (!shouldScheduleHide(egg.mode)) {
    return
  }

  const duration = eggDurationMs(egg.durationMs, prefersReducedMotion())
  document.documentElement.style.setProperty('--easter-egg-duration', `${duration}ms`)
  hideTimer = setTimeout(() => {
    dismissEgg()
  }, duration)
}

function clearActiveEgg() {
  const egg = activeEgg

  clearHideTimer()
  activeEgg = null
  document.documentElement.removeAttribute(EASTER_EGG_ATTRIBUTE)
  document.documentElement.style.removeProperty('--easter-egg-duration')
  writeStorage(clearStoredEasterEggs)

  return egg
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
  const egg = clearActiveEgg()
  egg?.onDismiss?.()
  playNamedSound(eggSoundName(Boolean(options.silent), egg?.soundOff))
}

function dismissIfReplacing(egg: EasterEgg) {
  if (!shouldReplaceActiveEgg(activeEgg?.id, egg.id)) {
    return
  }

  dismissEgg({ silent: true })
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

function handleEscape() {
  resetProgress()

  if (!escapeDismissesEgg(activeEgg?.mode)) {
    return
  }

  dismissEgg()
}

function onKeyDown(event: KeyboardEvent) {
  const input = toKeyInput(event)
  const target = getEggTarget(event.target)

  if (shouldIgnoreEasterEggInput(input, target)) {
    return
  }

  if (input.key === 'Escape') {
    handleEscape()
    return
  }

  applySequenceKey(input.code)
}

function persistToggleEgg(egg: EasterEgg) {
  if (!shouldPersistEgg(egg.mode)) {
    return
  }

  writeStorage((storage) => persistEasterEggId(storage, egg.id))
}

function playNamedSound(name: SoundName | undefined) {
  if (!name) {
    return
  }

  play(name)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function presentEgg(egg: EasterEgg) {
  clearHideTimer()
  activeEgg = egg
  document.documentElement.setAttribute(EASTER_EGG_ATTRIBUTE, egg.id)
  persistToggleEgg(egg)
  armTimedEgg(egg)
  egg.onActivate?.()
}

function remountActiveEgg() {
  if (!activeEgg) {
    return
  }

  document.documentElement.setAttribute(EASTER_EGG_ATTRIBUTE, activeEgg.id)
  activeEgg.onActivate?.()
}

function resetProgress() {
  progressById = new Map()
  clearIdleTimer()
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
    progressById = new Map()
    idleTimer = null
  }, EASTER_EGG_IDLE_RESET_MS)
}

function sequenceEggs() {
  return EASTER_EGGS.filter((egg) => egg.trigger.type === 'sequence')
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
