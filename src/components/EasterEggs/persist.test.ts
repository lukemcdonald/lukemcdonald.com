import type { StorageLike } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { EASTER_EGG_ATTRIBUTE, EASTER_EGG_STORAGE_PREFIX } from './constants.ts'
import {
  clearStoredEasterEggs,
  eggStorageKey,
  getEasterEggInitScript,
  getStoredEasterEggId,
  persistEasterEggId,
} from './persist.ts'

function createMemoryStorage(initial: Record<string, string> = {}): StorageLike & {
  data: Record<string, string>
} {
  const data = { ...initial }

  return {
    data,
    getItem(key) {
      return Object.hasOwn(data, key) ? data[key] : null
    },
    key(index) {
      return Object.keys(data)[index] ?? null
    },
    get length() {
      return Object.keys(data).length
    },
    removeItem(key) {
      delete data[key]
    },
    setItem(key, value) {
      data[key] = value
    },
  }
}

describe('easter egg persistence', () => {
  test('reads the first stored on egg and ignores other keys', () => {
    const storage = createMemoryStorage({
      [eggStorageKey('aurora')]: 'on',
      theme: 'dark',
    })

    assert.equal(getStoredEasterEggId(storage), 'aurora')
  })

  test('ignores stored egg keys that are not on', () => {
    const storage = createMemoryStorage({
      [eggStorageKey('aurora')]: 'off',
    })

    assert.equal(getStoredEasterEggId(storage), undefined)
  })

  test('persist replaces any previous egg and clear removes them', () => {
    const storage = createMemoryStorage({
      [eggStorageKey('aurora')]: 'on',
    })

    persistEasterEggId(storage, 'holiday')
    assert.equal(storage.data[eggStorageKey('aurora')], undefined)
    assert.equal(storage.data[eggStorageKey('holiday')], 'on')
    assert.equal(getStoredEasterEggId(storage), 'holiday')

    clearStoredEasterEggs(storage)
    assert.equal(getStoredEasterEggId(storage), undefined)
    assert.equal(Object.keys(storage.data).length, 0)
  })

  test('init script restores the stored egg attribute from localStorage', () => {
    const script = getEasterEggInitScript()

    assert.match(script, new RegExp(EASTER_EGG_STORAGE_PREFIX))
    assert.match(script, new RegExp(EASTER_EGG_ATTRIBUTE))
    assert.match(script, /localStorage/)
  })
})
