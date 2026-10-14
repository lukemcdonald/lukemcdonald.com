import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { STORAGE_KEYS } from '@/utils/storage'

import { DEFAULT_THEME_COLOR, THEME_COLORS } from './constants.ts'
import { getThemeColor } from './utils.ts'

function installBrowserStubs() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem() {
        return null
      },
    },
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  })
}

describe('getThemeColor', () => {
  const store = new Map<string, string>()
  const mockGetItem = mock.fn((key: string) => {
    return store.get(key) ?? null
  })

  before(() => {
    installBrowserStubs()
  })

  beforeEach(() => {
    mock.method(globalThis.localStorage, 'getItem', mockGetItem)
  })

  afterEach(() => {
    store.clear()
    mock.restoreAll()
  })

  test('returns the stored color when it is known', () => {
    for (const color of THEME_COLORS) {
      store.set(STORAGE_KEYS.themeColor, color)

      assert.equal(getThemeColor(), color)
    }
  })

  test('falls back to default when the stored color was removed', () => {
    for (const removed of ['green', 'neon']) {
      store.set(STORAGE_KEYS.themeColor, removed)

      assert.equal(getThemeColor(), DEFAULT_THEME_COLOR)
    }
  })
})
