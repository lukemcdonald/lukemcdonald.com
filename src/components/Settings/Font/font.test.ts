import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_FONT_PAIRING, getFontPairing, selectFontOption } from './font.ts'
import { fontPairingStyleId } from './load-pairing.ts'
import { FONT_PAIRING_CSS_SCRIPT_ID } from './pairings.ts'

function createFontStorage() {
  const store = new Map<string, string>()
  const mockGetItem = mock.fn((key: string) => {
    return store.get(key) ?? null
  })
  const mockRemoveItem = mock.fn((key: string) => {
    store.delete(key)
  })
  const mockSetItem = mock.fn((key: string, value: string) => {
    store.set(key, value)
  })

  return { mockGetItem, mockRemoveItem, mockSetItem, store }
}

function installBrowserStubs({
  mockGetItem,
  mockRemoveItem,
  mockSetItem,
}: ReturnType<typeof createFontStorage>) {
  const styles = new Map<string, { id: string; textContent: string }>()

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: mock.fn(() => {
        return { id: '', textContent: '' }
      }),
      documentElement: {
        dataset: {},
      },
      getElementById: mock.fn((id: string) => {
        if (id === FONT_PAIRING_CSS_SCRIPT_ID) {
          return {
            textContent: JSON.stringify({
              live: '.live{}',
              play: '.play{}',
              work: '.work{}',
            }),
          }
        }

        return styles.get(id) ?? null
      }),
      head: {
        append: mock.fn((node: { id: string; textContent: string }) => {
          styles.set(node.id, node)
        }),
      },
    },
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: mockGetItem,
      removeItem: mockRemoveItem,
      setItem: mockSetItem,
    },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  })
}

describe('selectFontOption', () => {
  const { mockGetItem, mockRemoveItem, mockSetItem, store } = createFontStorage()

  before(() => {
    installBrowserStubs({
      mockGetItem,
      mockRemoveItem,
      mockSetItem,
      store,
    })
  })

  beforeEach(() => {
    mock.method(globalThis.localStorage, 'getItem', mockGetItem)
    mock.method(globalThis.localStorage, 'removeItem', mockRemoveItem)
    mock.method(globalThis.localStorage, 'setItem', mockSetItem)
  })

  afterEach(() => {
    store.clear()
    delete document.documentElement.dataset.font
    mock.restoreAll()
  })

  test('applies a known pairing and persists it', () => {
    const applied = selectFontOption('live')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), 'live')
    assert.equal(document.documentElement.dataset.font, 'live')
    assert.equal(store.get(STORAGE_KEYS.font), 'live')
    assert.equal(document.getElementById(fontPairingStyleId('live'))?.textContent, '.live{}')
  })

  test('toggles the active pairing back to default', () => {
    selectFontOption('work')

    const applied = selectFontOption('work')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), DEFAULT_FONT_PAIRING)
    assert.equal(document.documentElement.dataset.font, undefined)
    assert.equal(store.get(STORAGE_KEYS.font), undefined)
  })
})

describe('getFontPairing', () => {
  const { mockGetItem, mockRemoveItem, mockSetItem, store } = createFontStorage()

  before(() => {
    installBrowserStubs({
      mockGetItem,
      mockRemoveItem,
      mockSetItem,
      store,
    })
  })

  beforeEach(() => {
    mock.method(globalThis.localStorage, 'getItem', mockGetItem)
    mock.method(globalThis.localStorage, 'removeItem', mockRemoveItem)
    mock.method(globalThis.localStorage, 'setItem', mockSetItem)
  })

  afterEach(() => {
    store.clear()
    mock.restoreAll()
  })

  test('falls back when storage has an unknown pairing', () => {
    store.set(STORAGE_KEYS.font, 'comic-sans')

    assert.equal(getFontPairing(), DEFAULT_FONT_PAIRING)
  })
})
