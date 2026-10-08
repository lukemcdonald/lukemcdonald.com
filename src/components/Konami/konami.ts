import type { KonamiAction, KonamiKeyInput, KonamiTarget } from './utils'

import { play } from 'cuelume'

import {
  KONAMI_ATTRIBUTE,
  KONAMI_DURATION_MS,
  KONAMI_DURATION_REDUCED_MS,
  KONAMI_IDLE_RESET_MS,
} from './constants'
import { interpretKonamiKey } from './utils'

let hideTimer: ReturnType<typeof setTimeout> | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
let progress = 0
let started = false

function activateKonami() {
  if (isKonamiActive()) {
    return
  }

  const duration = prefersReducedMotion() ? KONAMI_DURATION_REDUCED_MS : KONAMI_DURATION_MS
  const html = document.documentElement

  html.setAttribute(KONAMI_ATTRIBUTE, '')
  html.style.setProperty('--konami-duration', `${duration}ms`)
  play('success')

  hideTimer = setTimeout(() => {
    dismissKonami()
  }, duration)
}

function applyKonamiAction(action: KonamiAction) {
  if (action === 'activate') {
    activateKonami()
    return
  }

  if (action === 'dismiss') {
    dismissKonami()
  }
}

function clearIdleTimer() {
  if (!idleTimer) {
    return
  }

  clearTimeout(idleTimer)
  idleTimer = null
}

function clearTimers() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  clearIdleTimer()
}

function dismissKonami() {
  clearTimers()
  document.documentElement.removeAttribute(KONAMI_ATTRIBUTE)
  document.documentElement.style.removeProperty('--konami-duration')
}

function getKonamiTarget(target: EventTarget | null): KonamiTarget | null {
  if (!(target instanceof Element)) {
    return null
  }

  return {
    closestDialog: target.closest('dialog, [role="dialog"]') !== null,
    isContentEditable: target.closest('[contenteditable]:not([contenteditable="false"])') !== null,
    tagName: target.closest('input, select, textarea')?.tagName ?? target.tagName,
  }
}

function isKonamiActive() {
  return document.documentElement.hasAttribute(KONAMI_ATTRIBUTE)
}

function onKeyDown(event: KeyboardEvent) {
  const result = interpretKonamiKey(toKonamiKeyInput(event), getKonamiTarget(event.target), {
    active: isKonamiActive(),
    progress,
  })

  progress = result.progress
  clearIdleTimer()

  if (result.action === 'progress' && progress > 0) {
    scheduleIdleReset()
    return
  }

  applyKonamiAction(result.action)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scheduleIdleReset() {
  idleTimer = setTimeout(() => {
    progress = 0
    idleTimer = null
  }, KONAMI_IDLE_RESET_MS)
}

function toKonamiKeyInput(event: KeyboardEvent): KonamiKeyInput {
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

/** Installs one document listener; later calls are no-ops across view transitions. */
export function initializeKonami() {
  if (typeof window === 'undefined' || started) {
    return
  }

  started = true
  document.addEventListener('keydown', onKeyDown)
}
