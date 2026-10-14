import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import { getStorageItem, getStorageKeys, removeStorageItem, setStorageItem } from './storage.ts'

function installStorage() {
  const store = new Map<string, string>()

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem(key: string) {
        return store.get(key) ?? null
      },
      key(index: number) {
        return [...store.keys()][index] ?? null
      },
      get length() {
        return store.size
      },
      removeItem(key: string) {
        store.delete(key)
      },
      setItem(key: string, value: string) {
        store.set(key, value)
      },
    },
  })

  return store
}

function installBlockedStorage() {
  const blocked = () => {
    throw new Error('blocked')
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: blocked,
      key: blocked,
      get length() {
        return blocked()
      },
      removeItem: blocked,
      setItem: blocked,
    },
  })
}

describe('getStorageItem', () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage
  })

  test('returns the stored value', () => {
    const store = installStorage()
    store.set('color', 'dark')

    assert.equal(getStorageItem('color'), 'dark')
  })

  test('returns null when storage is blocked', () => {
    installBlockedStorage()

    assert.equal(getStorageItem('color'), null)
  })
})

describe('getStorageKeys', () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage
  })

  test('returns stored keys', () => {
    const store = installStorage()
    store.set('a', 'live')
    store.set('b', 'dark')

    assert.deepEqual(getStorageKeys().toSorted(), ['a', 'b'])
  })

  test('returns an empty list when storage is blocked', () => {
    installBlockedStorage()

    assert.deepEqual(getStorageKeys(), [])
  })
})

describe('removeStorageItem', () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage
  })

  test('removes the stored value', () => {
    const store = installStorage()
    store.set('font', 'live')

    removeStorageItem('font')

    assert.equal(store.has('font'), false)
  })

  test('does not throw when storage is blocked', () => {
    installBlockedStorage()

    removeStorageItem('font')
  })
})

describe('setStorageItem', () => {
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage
  })

  test('writes the value', () => {
    const store = installStorage()

    setStorageItem('glass', 'solid')

    assert.equal(store.get('glass'), 'solid')
  })

  test('does not throw when storage is blocked', () => {
    installBlockedStorage()

    setStorageItem('glass', 'solid')
  })
})
