import assert from 'node:assert/strict'
import { afterEach, before, describe, test } from 'node:test'

import { getSoundPreference } from '@/components/Sound/utils'
import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'

import {
  applySoundSelection,
  applyThemeColorSelection,
  applyThemeModeSelection,
} from './mobile-menu-prefs.ts'

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

  const documentElement = {
    classList: {
      toggle: () => {},
    },
    removeAttribute: () => {},
    setAttribute: () => {},
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorage,
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis,
  })
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement,
    },
  })
}

before(() => {
  installBrowserStubs()
})

afterEach(() => {
  store.clear()
})

describe('applyThemeColorSelection', () => {
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

describe('applyThemeModeSelection', () => {
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

describe('applySoundSelection', () => {
  test('checking sound on sets preference to on', () => {
    const preference = applySoundSelection(true)

    assert.equal(preference, 'on')
    assert.equal(getSoundPreference(), 'on')
  })

  test('unchecking sound sets preference to off', () => {
    applySoundSelection(true)

    const preference = applySoundSelection(false)

    assert.equal(preference, 'off')
    assert.equal(getSoundPreference(), 'off')
  })
})
