/**
 * Tiny Konami-style extras. Add eggs/<id>.ts + eggs/<id>.css and one line in
 * EGGS. Delete those to remove it. CSS is globbed from EasterEggs.astro so a
 * restored egg does not flash. Toggle state is localStorage `easter-egg:<id>=on`,
 * applied by the inline head script in Head.astro.
 */
import type { SoundName } from 'cuelume'

import { play } from 'cuelume'

import { auroraEgg } from './eggs/aurora'

type Egg = {
  id: string
  onActivate?: () => void
  onDismiss?: () => void
  sequence: readonly string[]
  soundOff?: SoundName
  soundOn?: SoundName
}

const ATTRIBUTE = 'data-easter-egg'
const EGGS: readonly Egg[] = [auroraEgg]
const IDLE_MS = 2500
const STORAGE_ON = 'on'
const STORAGE_PREFIX = 'easter-egg:'

let activeEgg: Egg | undefined
let idleTimer: ReturnType<typeof setTimeout> | undefined
let progressById = new Map<string, number>()
let started = false

export function getEasterEggInitScript(): string {
  return `
(function() {
  try {
    const prefix = '${STORAGE_PREFIX}';
    const on = '${STORAGE_ON}';
    const html = document.documentElement;

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (!key || key.indexOf(prefix) !== 0) {
        continue;
      }

      if (localStorage.getItem(key) !== on) {
        continue;
      }

      html.setAttribute('${ATTRIBUTE}', key.slice(prefix.length));
      break;
    }
  } catch (e) {}
})();
`.trim()
}

export function initializeEasterEggs() {
  if (typeof window === 'undefined' || started) {
    return
  }

  started = true
  restoreEgg()
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('astro:after-swap', remountEgg)
}

function advanceProgress(progress: number, code: string, sequence: readonly string[]): number {
  const attempted = sequence.slice(0, progress).concat(code)
  let length = Math.min(attempted.length, sequence.length)

  while (length > 0) {
    if (matchesPrefix(attempted, length, sequence)) {
      return length
    }

    length -= 1
  }

  return 0
}

function applyCode(code: string) {
  const completed = collectCompleted(code)

  if (completed.length === 0) {
    scheduleIdleReset()
    return
  }

  resetProgress()
  toggleEgg(pickEgg(completed))
}

function clearIdleTimer() {
  if (!idleTimer) {
    return
  }

  clearTimeout(idleTimer)
  idleTimer = undefined
}

function clearStoredEggs() {
  const keys: string[] = []

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)

    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key)
    }
  }

  for (const key of keys) {
    localStorage.removeItem(key)
  }
}

function collectCompleted(code: string): Egg[] {
  const completed: Egg[] = []

  for (const egg of EGGS) {
    if (stepEgg(egg, code)) {
      completed.push(egg)
    }
  }

  return completed
}

function hasBlockingFlags(event: KeyboardEvent): boolean {
  return [
    event.altKey,
    event.ctrlKey,
    event.defaultPrevented,
    event.isComposing,
    event.metaKey,
    event.repeat,
  ].some(Boolean)
}

function hideEgg(silent = false) {
  const egg = activeEgg

  activeEgg = undefined
  document.documentElement.removeAttribute(ATTRIBUTE)
  writeStorage(clearStoredEggs)
  egg?.onDismiss?.()
  playSound(silent ? undefined : egg?.soundOff)
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  if (target.closest('dialog, [role="dialog"]')) {
    return true
  }

  if (target.closest('[contenteditable]:not([contenteditable="false"])')) {
    return true
  }

  return Boolean(target.closest('input, select, textarea'))
}

function matchesPrefix(attempted: string[], length: number, sequence: readonly string[]): boolean {
  const suffix = attempted.slice(-length)

  return suffix.every((item, index) => item === sequence[index])
}

function onKeyDown(event: KeyboardEvent) {
  if (shouldIgnore(event)) {
    return
  }

  if (event.key === 'Escape') {
    resetProgress()
    return
  }

  applyCode(event.code)
}

function pickEgg(completed: readonly Egg[]): Egg | undefined {
  // A second egg or a date-based pick would go here.
  return completed[0]
}

function playSound(name: SoundName | undefined) {
  if (!name) {
    return
  }

  play(name)
}

function readStoredEggId(): string | undefined {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)

    if (!key?.startsWith(STORAGE_PREFIX)) {
      continue
    }

    if (localStorage.getItem(key) !== STORAGE_ON) {
      continue
    }

    return key.slice(STORAGE_PREFIX.length)
  }

  return undefined
}

function remountEgg() {
  if (!activeEgg) {
    return
  }

  document.documentElement.setAttribute(ATTRIBUTE, activeEgg.id)
  activeEgg.onActivate?.()
}

function resetProgress() {
  progressById = new Map()
  clearIdleTimer()
}

function restoreEgg() {
  const storedId = storedEggId()
  const egg = EGGS.find((item) => item.id === storedId)

  if (!egg) {
    document.documentElement.removeAttribute(ATTRIBUTE)
    writeStorage(clearStoredEggs)
    return
  }

  showEgg(egg, true)
}

function scheduleIdleReset() {
  clearIdleTimer()
  idleTimer = setTimeout(() => {
    progressById = new Map()
    idleTimer = undefined
  }, IDLE_MS)
}

function setProgress(id: string, next: number) {
  if (next === 0) {
    progressById.delete(id)
    return
  }

  progressById.set(id, next)
}

function shouldIgnore(event: KeyboardEvent): boolean {
  if (hasBlockingFlags(event)) {
    return true
  }

  return isTypingTarget(event.target)
}

function showEgg(egg: Egg, silent = false) {
  activeEgg = egg
  document.documentElement.setAttribute(ATTRIBUTE, egg.id)
  writeStorage(() => {
    clearStoredEggs()
    localStorage.setItem(`${STORAGE_PREFIX}${egg.id}`, STORAGE_ON)
  })
  egg.onActivate?.()
  playSound(silent ? undefined : egg.soundOn)
}

function stepEgg(egg: Egg, code: string): boolean {
  const next = advanceProgress(progressById.get(egg.id) ?? 0, code, egg.sequence)

  if (next >= egg.sequence.length) {
    progressById.delete(egg.id)
    return true
  }

  setProgress(egg.id, next)
  return false
}

function storedEggId(): string | undefined {
  try {
    return readStoredEggId()
  } catch {
    return undefined
  }
}

function toggleEgg(egg: Egg | undefined) {
  if (!egg) {
    return
  }

  if (activeEgg?.id === egg.id) {
    hideEgg()
    return
  }

  showEgg(egg)
}

function writeStorage(write: () => void) {
  try {
    write()
  } catch {
    return
  }
}
