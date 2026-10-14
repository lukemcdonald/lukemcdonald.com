import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { applyThemeModeSelection } from './theme-mode.ts'
import { getThemeMode } from './utils.ts'

function installBrowserStubs({
  mockClassListToggle,
  mockGetItem,
  mockSetItem,
}: {
  mockClassListToggle: () => void
  mockGetItem: (key: string) => string | null
  mockSetItem: (key: string, value: string) => void
}) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: {
        classList: {
          toggle: mockClassListToggle,
        },
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

describe('applyThemeModeSelection', () => {
  const store = new Map<string, string>()
  const mockClassListToggle = mock.fn()
  const mockGetItem = mock.fn((key: string) => {
    return store.get(key) ?? null
  })
  const mockSetItem = mock.fn((key: string, value: string) => {
    store.set(key, value)
  })

  before(() => {
    installBrowserStubs({
      mockClassListToggle,
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
    mock.restoreAll()
  })

  test('applies a known mode', () => {
    const applied = applyThemeModeSelection('dark')

    assert.equal(applied, true)
    assert.equal(getThemeMode(), 'dark')
  })

  test('does not write unknown modes', () => {
    applyThemeModeSelection('light')

    const applied = applyThemeModeSelection('sepia')

    assert.equal(applied, false)
    assert.equal(getThemeMode(), 'light')
  })
})
