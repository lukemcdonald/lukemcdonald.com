import assert from 'node:assert/strict'
import { afterEach, before, beforeEach, describe, mock, test } from 'node:test'

import { getGlassLevel } from '@/components/Glass/utils'
import { getThemeColor } from '@/components/ThemeColor/utils'
import { getThemeMode } from '@/components/ThemeMode/utils'

import {
  applyGlassSelection,
  applyPreference,
  applyThemeColorSelection,
  applyThemeModeSelection,
} from './settings.utils.ts'

function installBrowserStubs({
  mockClassListToggle,
  mockGetItem,
  mockRemoveAttribute,
  mockSetAttribute,
  mockSetItem,
}: {
  mockClassListToggle: () => void
  mockGetItem: (key: string) => string | null
  mockRemoveAttribute: () => void
  mockSetAttribute: () => void
  mockSetItem: (key: string, value: string) => void
}) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      documentElement: {
        classList: {
          toggle: mockClassListToggle,
        },
        dataset: {},
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

describe('settings.utils', () => {
  const store = new Map<string, string>()
  const mockClassListToggle = mock.fn()
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
      mockClassListToggle,
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

  describe('applyGlassSelection', () => {
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

  describe('applyPreference', () => {
    test('routes color, glass, and mode values', () => {
      assert.equal(applyPreference('color', 'orange'), true)
      assert.equal(getThemeColor(), 'orange')
      assert.equal(applyPreference('glass', 'clear'), true)
      assert.equal(getGlassLevel(), 'clear')
      assert.equal(applyPreference('mode', 'dark'), true)
      assert.equal(getThemeMode(), 'dark')
    })

    test('rejects unknown kinds and values', () => {
      applyPreference('color', 'blue')
      applyPreference('glass', 'tinted')
      applyPreference('mode', 'light')

      assert.equal(applyPreference('sound', 'on'), false)
      assert.equal(applyPreference('color', 'hotpink'), false)
      assert.equal(getThemeColor(), 'blue')
      assert.equal(getGlassLevel(), 'tinted')
      assert.equal(getThemeMode(), 'light')
    })
  })
})
