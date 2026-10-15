/**
 * Tiny Konami-style extras. Add eggs/<id>.ts + eggs/<id>.css and one line in
 * EGGS. Delete those to remove it. CSS is loaded when an egg is shown. Active-egg
 * keys use the shared storage prefix, applied by the inline head script in Head.astro.
 */
import type { SoundName } from 'cuelume'

import { playSound } from '@/components/Settings/Sound/utils'
import {
  getStorageItem,
  getStorageKeys,
  removeStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '@/utils/storage'

import { auroraEgg } from './eggs/aurora'
import { hyruleEgg } from './eggs/hyrule'
import { lampEgg } from './eggs/lamp'

type Egg = {
  dismissOnEscape?: boolean
  id: string
  onActivate?: (silent?: boolean) => void
  onDismiss?: () => void
  onInit?: () => void
  sequence: readonly string[]
  soundOff?: SoundName
  soundOn?: SoundName
}

const ATTRIBUTE = 'data-easter-egg'
const EGGS: readonly Egg[] = [auroraEgg, hyruleEgg, lampEgg]
const CYCLE_STEPS = EGGS.length + 1
const IDLE_MS = 2500
const STORAGE_ON = 'on'

let activeEgg: Egg | undefined
let cycleIndex = 0
let idleTimer: ReturnType<typeof setTimeout> | undefined
let progressById = new Map<string, number>()
let started = false

export function initializeEasterEggs() {
  if (typeof window === 'undefined' || started) {
    return
  }

  started = true
  startEggs()
  restoreEgg()
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('astro:after-swap', remountEgg)
}

export function getActiveEasterEggId() {
  return currentEggId()
}

export function getEasterEggs() {
  return EGGS.map((egg) => ({
    id: egg.id,
    name: eggName(egg.id),
  }))
}

export function getFoundEasterEggIds() {
  return readFoundIds()
}

export function toggleEasterEgg(id: string) {
  toggleEgg(EGGS.find((egg) => egg.id === id))
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
  dispatchCompleted(completed)
}

function clearIdleTimer() {
  if (!idleTimer) {
    return
  }

  clearTimeout(idleTimer)
  idleTimer = undefined
}

function clearStoredEggs() {
  for (const key of getStorageKeys()) {
    if (key.startsWith(STORAGE_KEYS.easterEggPrefix)) {
      removeStorageItem(key)
    }
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

function currentEggId() {
  return storedEggId() ?? activeEgg?.id
}

function cycleEgg() {
  const index = pickCycleIndex()
  const egg = EGGS[index]

  writeCycleIndex(nextCycleIndex(index))

  if (!egg) {
    hideEgg()
    return
  }

  markFound(egg.id)
  showEgg(egg)
}

function dispatchCompleted(completed: readonly Egg[]) {
  if (completed.some(isCycleTrigger)) {
    cycleEgg()
    return
  }

  toggleEgg(pickEgg(completed))
}

function eggName(id: string) {
  return `${id.slice(0, 1).toUpperCase()}${id.slice(1)}`
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

function hasOpenDialog() {
  return Boolean(document.querySelector('dialog[open], [role="dialog"]:not(dialog)'))
}

function hideEgg(silent = false) {
  const egg = activeEgg

  activeEgg = undefined
  document.documentElement.removeAttribute(ATTRIBUTE)
  clearStoredEggs()
  egg?.onDismiss?.()
  playEggSound(silent ? undefined : egg?.soundOff)
}

function isCurrentCycleStep(index: number) {
  return EGGS[index]?.id === currentEggId()
}

function isCycleTrigger(egg: Egg) {
  return egg.id === auroraEgg.id
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

function markFound(id: string) {
  const found = readFoundIds()

  if (found.includes(id)) {
    return
  }

  setStorageItem(STORAGE_KEYS.easterEggFound, JSON.stringify([...found, id]))
}

function matchesPrefix(attempted: string[], length: number, sequence: readonly string[]): boolean {
  const suffix = attempted.slice(-length)

  return suffix.every((item, index) => item === sequence[index])
}

function nextCycleIndex(index: number) {
  return (index + 1) % CYCLE_STEPS
}

function onEscape() {
  resetProgress()

  if (activeEgg?.dismissOnEscape) {
    hideEgg()
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (shouldIgnore(event)) {
    return
  }

  if (event.key === 'Escape') {
    onEscape()
    return
  }

  applyCode(event.code)
}

function parseCycleIndex(stored: string | null) {
  const index = Number.parseInt(stored ?? '0', 10)

  if (!Number.isFinite(index) || index < 0) {
    return 0
  }

  return index % CYCLE_STEPS
}

function parseFoundIds(raw: string | null) {
  if (!raw) {
    return []
  }

  const parsed: unknown = JSON.parse(raw)

  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.filter((id): id is string => typeof id === 'string')
}

function pickCycleIndex() {
  const index = readCycleIndex()

  if (isCurrentCycleStep(index)) {
    return nextCycleIndex(index)
  }

  return index
}

function pickEgg(completed: readonly Egg[]): Egg | undefined {
  return completed[0]
}

async function loadEggStyles(id: string) {
  const { loadEggStyles: load } = await import('./load-egg-styles')

  return load(id)
}

function playEggSound(name: SoundName | undefined) {
  if (!name) {
    return
  }

  playSound(name)
}

function readCycleIndex() {
  cycleIndex = parseCycleIndex(getStorageItem(STORAGE_KEYS.easterEggCycle))

  return cycleIndex
}

function readFoundIds() {
  try {
    const known = new Set(EGGS.map((egg) => egg.id))

    return parseFoundIds(getStorageItem(STORAGE_KEYS.easterEggFound)).filter((id) => known.has(id))
  } catch {
    return []
  }
}

function readStoredEggId(): string | undefined {
  for (const key of getStorageKeys()) {
    if (!key.startsWith(STORAGE_KEYS.easterEggPrefix)) {
      continue
    }

    if (getStorageItem(key) !== STORAGE_ON) {
      continue
    }

    return key.slice(STORAGE_KEYS.easterEggPrefix.length)
  }

  return undefined
}

function remountEgg() {
  if (!activeEgg) {
    return
  }

  const egg = activeEgg

  void loadEggStyles(egg.id).then(() => {
    if (activeEgg !== egg) {
      return
    }

    document.documentElement.setAttribute(ATTRIBUTE, egg.id)
    egg.onActivate?.(true)
  })
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
    clearStoredEggs()
    return
  }

  markFound(egg.id)
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
  if (hasBlockingFlags(event) || hasOpenDialog()) {
    return true
  }

  return isTypingTarget(event.target)
}

function startEggs() {
  for (const egg of EGGS) {
    egg.onInit?.()
  }
}

function dismissOtherEgg(nextId: string) {
  if (!activeEgg || activeEgg.id === nextId) {
    return
  }

  hideEgg(true)
}

function showEgg(egg: Egg, silent = false) {
  dismissOtherEgg(egg.id)
  activeEgg = egg
  clearStoredEggs()
  setStorageItem(`${STORAGE_KEYS.easterEggPrefix}${egg.id}`, STORAGE_ON)
  void loadEggStyles(egg.id).then(() => {
    if (activeEgg !== egg) {
      return
    }

    document.documentElement.setAttribute(ATTRIBUTE, egg.id)
    egg.onActivate?.(silent)
    playEggSound(silent ? undefined : egg.soundOn)
  })
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
  return readStoredEggId()
}

function toggleEgg(egg: Egg | undefined) {
  if (!egg) {
    return
  }

  markFound(egg.id)

  if (currentEggId() === egg.id) {
    hideEgg()
    return
  }

  showEgg(egg)
}

function writeCycleIndex(index: number) {
  cycleIndex = index
  setStorageItem(STORAGE_KEYS.easterEggCycle, String(index))
}
