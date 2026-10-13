import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { getGlassLevel } from '@/components/Glass/utils'

import { applyGlassSelection } from './glass.ts'

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

describe('applyGlassSelection', () => {
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
    mock.restoreAll()
  })

  test('applies a known glass level', () => {
    const applied = applyGlassSelection('solid')

    assert.equal(applied, true)
    assert.equal(getGlassLevel(), 'solid')
  })

  test('does not write unknown glass levels', () => {
    applyGlassSelection('tinted')

    const applied = applyGlassSelection('frosted')

    assert.equal(applied, false)
    assert.equal(getGlassLevel(), 'tinted')
  })
})
