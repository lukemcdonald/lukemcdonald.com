import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { applyFontSelection, getFontPairing } from './font.ts'

function installBrowserStubs({
  mockGetItem,
  mockSetItem,
}: {
  mockGetItem: (key: string) => string | null
  mockSetItem: (key: string, value: string) => void
}) {
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
      setItem: mockSetItem,
    },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  })
}

describe('applyFontSelection', () => {
  const store = new Map<string, string>()
  const mockGetItem = mock.fn((key: string) => {
    return store.get(key) ?? null
  })
  const mockSetItem = mock.fn((key: string, value: string) => {
    store.set(key, value)
  })

  before(() => {
    installBrowserStubs({
      mockGetItem,
      mockSetItem,
    })
  })

  beforeEach(() => {
    mock.method(globalThis.localStorage, 'getItem', mockGetItem)
    mock.method(globalThis.localStorage, 'setItem', mockSetItem)
  })

  afterEach(() => {
    store.clear()
    delete document.documentElement.dataset.font
    mock.restoreAll()
  })

  test('applies a known pairing', () => {
    const applied = applyFontSelection('live')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), 'live')
    assert.equal(document.documentElement.dataset.font, 'live')
  })

  test('clears the document font for the default pairing', () => {
    applyFontSelection('work')

    const applied = applyFontSelection('home')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), 'home')
    assert.equal(document.documentElement.dataset.font, undefined)
  })

  test('does not write unknown pairings', () => {
    applyFontSelection('play')

    const applied = applyFontSelection('comic-sans')

    assert.equal(applied, false)
    assert.equal(getFontPairing(), 'play')
    assert.equal(document.documentElement.dataset.font, 'play')
  })
})
