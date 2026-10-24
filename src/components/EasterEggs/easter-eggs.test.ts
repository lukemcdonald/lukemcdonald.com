import assert from 'node:assert/strict'
import { afterEach, before, describe, test } from 'node:test'

import {
  applyEasterEggCode,
  EASTER_EGG_IDS,
  EASTER_EGG_SECRETS_EVENT,
  getActiveEasterEggId,
  getEasterEggCatalog,
  resetEasterEggs,
} from './easter-eggs.ts'

const EGG_CODES = {
  aurora: ['KeyI', 'KeyO', 'KeyW', 'KeyA'],
  fca: ['KeyF', 'KeyC', 'KeyA'],
  hyrule: ['KeyZ', 'KeyE', 'KeyL', 'KeyD', 'KeyA'],
  lamp: ['KeyS', 'KeyE', 'KeyL', 'KeyA', 'KeyH'],
} as const

const KONAMI_CODES = [
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

function applyCodes(codes: readonly string[]) {
  for (const code of codes) {
    applyEasterEggCode(code)
  }
}

function installBrowserStubs() {
  const store = new Map<string, string>()
  const listeners = new Map<string, Set<(event: Event) => void>>()

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      addEventListener(type: string, listener: (event: Event) => void) {
        const handlers = listeners.get(type) ?? new Set()

        handlers.add(listener)
        listeners.set(type, handlers)
      },
      body: {
        append() {
          return undefined
        },
      },
      createElement() {
        return {
          addEventListener(type: string, listener: () => void) {
            if (type === 'error' || type === 'load') {
              queueMicrotask(listener)
            }
          },
          dataset: {},
          setAttribute() {
            return undefined
          },
          style: {
            setProperty() {
              return undefined
            },
          },
        }
      },
      dispatchEvent(event: Event) {
        listeners.get(event.type)?.forEach((listener) => {
          listener(event)
        })

        return true
      },
      documentElement: {
        attributes: new Map<string, string>(),
        getAttribute(name: string) {
          return this.attributes.get(name) ?? null
        },
        removeAttribute(name: string) {
          this.attributes.delete(name)
        },
        setAttribute(name: string, value: string) {
          this.attributes.set(name, value)
        },
      },
      head: {
        append() {
          return undefined
        },
      },
      querySelector() {
        return null
      },
      querySelectorAll() {
        return []
      },
      removeEventListener(type: string, listener: (event: Event) => void) {
        listeners.get(type)?.delete(listener)
      },
    },
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem(key: string) {
        return store.get(key) ?? null
      },
      key(index: number) {
        return [...store.keys()][index] ?? null
      },
      get length() {
        return store.size
      },
      removeItem(key: string) {
        store.delete(key)
      },
      setItem(key: string, value: string) {
        store.set(key, value)
      },
    },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: Object.assign(globalThis, {
      matchMedia() {
        return { matches: false }
      },
    }),
  })
}

describe('getEasterEggCatalog', () => {
  test('returns names and hints without codes', () => {
    const catalog = getEasterEggCatalog()

    assert.deepEqual(
      catalog.map((secret) => secret.id),
      [...EASTER_EGG_IDS],
    )
    assert.equal(
      catalog.every((secret) => !('sequence' in secret)),
      true,
    )
    assert.equal(
      catalog.some((secret) => secret.hint.length === 0),
      false,
    )
    assert.equal(catalog.find((secret) => secret.id === 'fca')?.name, 'FCA All Abilities')
  })
})

describe('applyEasterEggCode', () => {
  before(() => {
    installBrowserStubs()
  })

  afterEach(() => {
    resetEasterEggs()
  })

  test('activates aurora from iowa', () => {
    applyCodes(EGG_CODES.aurora)

    assert.equal(getActiveEasterEggId(), 'aurora')
  })

  test('activates fca from fca', () => {
    applyCodes(EGG_CODES.fca)

    assert.equal(getActiveEasterEggId(), 'fca')
  })

  test('activates hyrule from zelda', () => {
    applyCodes(EGG_CODES.hyrule)

    assert.equal(getActiveEasterEggId(), 'hyrule')
  })

  test('activates lamp from selah', () => {
    applyCodes(EGG_CODES.lamp)

    assert.equal(getActiveEasterEggId(), 'lamp')
  })

  test('requests the Secrets screen from Konami', () => {
    let requested = false

    document.addEventListener(EASTER_EGG_SECRETS_EVENT, () => {
      requested = true
    })
    applyCodes(KONAMI_CODES)

    assert.equal(requested, true)
    assert.equal(getActiveEasterEggId(), undefined)
  })
})
