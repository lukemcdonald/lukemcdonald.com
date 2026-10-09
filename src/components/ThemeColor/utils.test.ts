import assert from 'node:assert/strict'
import { afterEach, before, describe, test } from 'node:test'

import { DEFAULT_THEME_COLOR, THEME_COLOR_STORAGE_KEY } from './constants.ts'
import { getThemeColor } from './utils.ts'

const store = new Map<string, string>()

function installBrowserStubs() {
  const localStorage = {
    getItem: (key: string) => {
      return store.get(key) ?? null
    },
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorage,
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  })
}

before(() => {
  installBrowserStubs()
})

afterEach(() => {
  store.clear()
})

describe('getThemeColor', () => {
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
