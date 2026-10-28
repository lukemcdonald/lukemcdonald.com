/**
 * Add eggs/<id>.ts + eggs/<id>.css and one line in EGGS. Head.astro applies active-egg storage keys.
 * zelda → hyrule
 * selah → lamp
 * iowa → aurora
 * fca → fca
 * Konami ↑↑↓↓←→←→BA → Secrets
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
import { fcaEgg } from './eggs/fca'
import { hyruleEgg } from './eggs/hyrule'
import { lampEgg } from './eggs/lamp'
import { isIgnoredEggKey } from './keys'

type Egg = {
  dismissOnEscape?: boolean
  hint: string
  id: string
  name?: string
  onActivate?: (silent?: boolean, dismiss?: () => void) => void | Promise<void>
  onDismiss?: () => void
  onInit?: () => void
  persist?: boolean
  sequence: readonly string[]
  soundOff?: SoundName
  soundOn?: SoundName
}

const ATTRIBUTE = 'data-easter-egg'
const EGGS: readonly Egg[] = [auroraEgg, fcaEgg, hyruleEgg, lampEgg]
const EGG_TEST_ID = 'easter-egg'
const IDLE_MS = 2500
const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const
const SECRETS_ID = 'secrets'
const STALE_CYCLE_KEY = 'easter-eggs:cycle'
const STORAGE_ON = 'on'
const TEST_ID = 'data-testid'

export const EASTER_EGG_IDS = [auroraEgg.id, fcaEgg.id, hyruleEgg.id, lampEgg.id] as const
export const EASTER_EGG_SECRETS_EVENT = 'easter-eggs:secrets'

let activeEgg: Egg | undefined
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
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('astro:after-swap', remountEgg)
}

export function applyEasterEggCode(code: string) {
  const secretsReady = stepSequence(SECRETS_ID, code, KONAMI_SEQUENCE)
  const completed = getCompletedEggs(code)

  if (!secretsReady && completed.length === 0) {
    scheduleIdleReset()
    return false
  }

  resetProgress()

  if (secretsReady) {
    requestSecrets()
    return true
  }

  void toggleEgg(completed[0])
  return true
}

export function getActiveEasterEggId() {
  return getCurrentEggId()
}

export function getEasterEggs() {
  return EGGS.map((egg) => ({
    id: egg.id,
    name: getEggName(egg),
  }))
}

export function getEasterEggCatalog() {
  return EGGS.map((egg) => ({
    hint: egg.hint,
    id: egg.id,
    name: getEggName(egg),
  }))
}

export function getFoundEasterEggIds() {
  return getFoundIds()
}

export async function findEasterEgg(id: string) {
  const egg = getEggById(id)

  if (!egg) {
    throw new Error(`Unknown easter egg: ${id}`)
  }

  const alreadyActive = getCurrentEggId() === egg.id

  if (!alreadyActive) {
    await toggleEgg(egg)
  }

  return {
    alreadyActive,
    id: egg.id,
    name: getEggName(egg),
  }
}

export function resetEasterEggs() {
  resetProgress()

  if (!activeEgg) {
    return
  }

  hideEgg(true)
}

export function toggleEasterEgg(id: string) {
  void toggleEgg(getEggById(id))
}

function advanceProgress(progress: number, code: string, sequence: readonly string[]): number {
  const attempted = sequence.slice(0, progress).concat(code)
  let length = Math.min(attempted.length, sequence.length)

  while (length > 0) {
    if (hasSequencePrefix(attempted, length, sequence)) {
      return length
    }

    length -= 1
  }

  return 0
}

function activateEgg(egg: Egg, silent: boolean) {
  setEggAttribute(egg.id)
  return egg.onActivate?.(silent, hideEgg)
}

function clearEggAttribute() {
  document.documentElement.removeAttribute(ATTRIBUTE)
  document.documentElement.removeAttribute(TEST_ID)
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

function getCompletedEggs(code: string): Egg[] {
  const completed: Egg[] = []

  for (const egg of EGGS) {
    if (stepSequence(egg.id, code, egg.sequence)) {
      completed.push(egg)
    }
  }

  return completed
}

function getCurrentEggId() {
  return getStoredEggId() ?? activeEgg?.id
}

function getEggById(id: string) {
  return EGGS.find((egg) => egg.id === id)
}

function getEggName(egg: Egg) {
  return egg.name ?? `${egg.id.slice(0, 1).toUpperCase()}${egg.id.slice(1)}`
}

function hasSequencePrefix(
  attempted: string[],
  length: number,
  sequence: readonly string[],
): boolean {
  const suffix = attempted.slice(-length)

  return suffix.every((item, index) => item === sequence[index])
}

function hideEgg(silent = false) {
  const egg = activeEgg

  activeEgg = undefined
  clearEggAttribute()
  clearStoredEggs()
  egg?.onDismiss?.()
  playEggSound(silent ? undefined : egg?.soundOff)
}

function isPersistedEgg(egg: Egg) {
  return egg.persist !== false
}

function markFound(id: string) {
  const found = getFoundIds()

  if (found.includes(id)) {
    return
  }

  setStorageItem(STORAGE_KEYS.easterEggFound, JSON.stringify([...found, id]))
}

function handleEscape() {
  resetProgress()

  if (activeEgg?.dismissOnEscape) {
    hideEgg()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (isIgnoredEggKey(event)) {
    return
  }

  if (event.key === 'Escape') {
    handleEscape()
    return
  }

  if (applyEasterEggCode(event.code)) {
    event.preventDefault()
  }
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

async function loadEggStyles(id: string) {
  const { loadEggStyles: load } = await import('./load-egg-styles')

  return load(id)
}

function persistEgg(egg: Egg) {
  if (isPersistedEgg(egg)) {
    setStorageItem(`${STORAGE_KEYS.easterEggPrefix}${egg.id}`, STORAGE_ON)
  }
}

function playEggSound(name: SoundName | undefined) {
  if (!name) {
    return
  }

  playSound(name)
}

function getFoundIds() {
  try {
    const known = new Set(EGGS.map((egg) => egg.id))

    return parseFoundIds(getStorageItem(STORAGE_KEYS.easterEggFound)).filter((id) => known.has(id))
  } catch {
    return []
  }
}

function getStoredEggId(): string | undefined {
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

  if (!isPersistedEgg(activeEgg)) {
    hideEgg(true)
    return
  }

  const egg = activeEgg

  void loadEggStyles(egg.id).then(async () => {
    if (activeEgg !== egg) {
      return
    }

    await activateEgg(egg, true)
  })
}

function requestSecrets() {
  document.dispatchEvent(new Event(EASTER_EGG_SECRETS_EVENT))
}

function resetProgress() {
  progressById = new Map()
  clearIdleTimer()
}

function restoreEgg() {
  const storedId = getStoredEggId()
  const egg = storedId ? getEggById(storedId) : undefined

  if (!egg || !isPersistedEgg(egg)) {
    clearEggAttribute()
    clearStoredEggs()
    return
  }

  markFound(egg.id)
  void showEgg(egg, true)
}

function scheduleIdleReset() {
  clearIdleTimer()
  idleTimer = setTimeout(() => {
    progressById = new Map()
    idleTimer = undefined
  }, IDLE_MS)
}

function setEggAttribute(id: string) {
  document.documentElement.setAttribute(ATTRIBUTE, id)
  document.documentElement.setAttribute(TEST_ID, EGG_TEST_ID)
}

function setProgress(id: string, next: number) {
  if (next === 0) {
    progressById.delete(id)
    return
  }

  progressById.set(id, next)
}

function startEggs() {
  removeStorageItem(STALE_CYCLE_KEY)

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

async function showEgg(egg: Egg, silent = false) {
  dismissOtherEgg(egg.id)
  activeEgg = egg
  clearStoredEggs()
  persistEgg(egg)
  await loadEggStyles(egg.id)

  if (activeEgg !== egg) {
    return
  }

  await activateEgg(egg, silent)
  playEggSound(silent ? undefined : egg.soundOn)
}

function stepSequence(id: string, code: string, sequence: readonly string[]): boolean {
  if (sequence.length === 0) {
    return false
  }

  const next = advanceProgress(progressById.get(id) ?? 0, code, sequence)

  if (next >= sequence.length) {
    progressById.delete(id)
    return true
  }

  setProgress(id, next)
  return false
}

async function toggleEgg(egg: Egg | undefined) {
  if (!egg) {
    return
  }

  markFound(egg.id)

  if (getCurrentEggId() === egg.id) {
    hideEgg()
    return
  }

  await showEgg(egg)
}
