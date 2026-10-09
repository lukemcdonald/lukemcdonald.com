import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { DEFAULT_THEME_COLOR, THEME_COLOR_STORAGE_KEY } from './constants.ts'
import { getThemeColor } from './utils.ts'

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
    store.set(THEME_COLOR_STORAGE_KEY, 'blue')

    assert.equal(getThemeColor(), 'blue')
  })

  test('falls back to default when the stored color was removed', () => {
    for (const removed of ['green', 'neon']) {
      store.set(THEME_COLOR_STORAGE_KEY, removed)

      assert.equal(getThemeColor(), DEFAULT_THEME_COLOR)
    }
  })
})

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
