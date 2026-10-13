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
    const applied = applyFontSelection('editorial')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), 'editorial')
    assert.equal(document.documentElement.dataset.font, 'editorial')
  })

  test('clears the document font for the default pairing', () => {
    applyFontSelection('mono')

    const applied = applyFontSelection('default')

    assert.equal(applied, true)
    assert.equal(getFontPairing(), 'default')
    assert.equal(document.documentElement.dataset.font, undefined)
  })

  test('does not write unknown pairings', () => {
    applyFontSelection('geometric')

    const applied = applyFontSelection('comic-sans')

    assert.equal(applied, false)
    assert.equal(getFontPairing(), 'geometric')
    assert.equal(document.documentElement.dataset.font, 'geometric')
  })
})
