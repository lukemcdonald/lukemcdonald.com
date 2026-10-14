import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { DEFAULT_FONT_PAIRING, FONT_STORAGE_KEY, getFontPairing, selectFontOption } from './font.ts'

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
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: {
        dataset: {},
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
    assert.equal(store.get(FONT_STORAGE_KEY), 'live')
  })

  test('toggles the active pairing back to default', () => {
    selectFontOption('work')

    const applied = selectFontOption('work')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), DEFAULT_FONT_PAIRING)
    assert.equal(document.documentElement.dataset.font, undefined)
    assert.equal(store.get(FONT_STORAGE_KEY), undefined)
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
    store.set(FONT_STORAGE_KEY, 'comic-sans')

    assert.equal(getFontPairing(), DEFAULT_FONT_PAIRING)
  })
})
