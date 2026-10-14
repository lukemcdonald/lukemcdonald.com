import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { applyThemeColorSelection } from './theme-color.ts'
import { getThemeColor } from './utils.ts'

function installBrowserStubs({
  mockGetItem,
  mockRemoveAttribute,
  mockSetAttribute,
  mockSetItem,
}: {
  mockGetItem: (key: string) => string | null
  mockRemoveAttribute: () => void
  mockSetAttribute: () => void
  mockSetItem: (key: string, value: string) => void
}) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: {
        removeAttribute: mockRemoveAttribute,
        setAttribute: mockSetAttribute,
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

describe('applyThemeColorSelection', () => {
  const store = new Map<string, string>()
  const mockGetItem = mock.fn((key: string) => {
    return store.get(key) ?? null
  })
  const mockRemoveAttribute = mock.fn()
  const mockSetAttribute = mock.fn()
  const mockSetItem = mock.fn((key: string, value: string) => {
    store.set(key, value)
  })

  before(() => {
    installBrowserStubs({
      mockGetItem,
      mockRemoveAttribute,
      mockSetAttribute,
      mockSetItem,
    })
  })

  beforeEach(() => {
    mock.method(globalThis.localStorage, 'getItem', mockGetItem)
    mock.method(globalThis.localStorage, 'setItem', mockSetItem)
  })

  afterEach(() => {
    store.clear()
    mock.restoreAll()
  })

  test('applies a known color', () => {
    const applied = applyThemeColorSelection('blue')

    assert.equal(applied, true)
    assert.equal(getThemeColor(), 'blue')
  })

  test('does not write unknown colors', () => {
    applyThemeColorSelection('blue')

    const applied = applyThemeColorSelection('hotpink')

    assert.equal(applied, false)
    assert.equal(getThemeColor(), 'blue')
  })
})
