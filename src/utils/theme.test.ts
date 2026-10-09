import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { THEME_COLOR_STORAGE_KEY } from '@/components/ThemeColor/constants'

import { getThemeInitScript } from './theme.ts'

describe('getThemeInitScript', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('falls back to default for unknown stored colors', () => {
    const mockClassListAdd = mock.fn()
    const mockClassListRemove = mock.fn()
    const mockGetItem = mock.fn((key: string) => {
      if (key === THEME_COLOR_STORAGE_KEY) {
        return 'neon'
      }

      return null
    })
    const mockMatchMedia = mock.fn(() => {
      return { matches: false }
    })
    const mockRemoveAttribute = mock.fn()
    const mockSetAttribute = mock.fn()

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        documentElement: {
          classList: {
            add: mockClassListAdd,
            remove: mockClassListRemove,
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
      },
    })
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        matchMedia: mockMatchMedia,
      },
    })

    new Function(getThemeInitScript())()

    assert.equal(mockSetAttribute.mock.callCount(), 0)
    assert.deepEqual(mockRemoveAttribute.mock.calls[0].arguments, ['data-theme'])
  })
})
