import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { FONT_PAIRINGS } from '@/components/Settings/Font/pairings.ts'
import { THEME_COLORS } from '@/components/Settings/ThemeColor/constants.ts'
import { THEME_MODES } from '@/components/Settings/ThemeMode/constants.ts'

import {
  FONT_PAIRING_VALUES,
  SECRET_IDS,
  THEME_COLOR_VALUES,
  THEME_MODE_VALUES,
} from './webmcp.constants.ts'
import {
  handleFindSecret,
  handleListSecrets,
  handleNavigateToPage,
  handleSetFontPairing,
  handleSetTheme,
  handleToggleSound,
  type WebMcpSecret,
  type WebMcpToolDeps,
} from './webmcp.tools.ts'

const CATALOG: readonly WebMcpSecret[] = [
  { hint: 'An old arcade handshake still lights the night.', id: 'aurora', name: 'Aurora' },
  { hint: 'A little song still sleeps in the keys.', id: 'hyrule', name: 'Hyrule' },
  {
    hint: 'After the first light, keep cycling; a verse waits in the dark.',
    id: 'lamp',
    name: 'Lamp',
  },
]

const SOLUTION_LEAKS = [
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'KeyA',
  'KeyB',
  'konami',
  'sequence',
]

function createDeps(overrides: Partial<WebMcpToolDeps> = {}) {
  const mockFindEasterEgg = mock.fn(async () => undefined)
  const mockGetEasterEggCatalog = mock.fn(() => CATALOG)
  const mockGetFontPairing = mock.fn(() => 'default' as const)
  const mockGetFoundEasterEggIds = mock.fn((): readonly string[] => [])
  const mockGetSoundPreference = mock.fn(() => 'off' as const)
  const mockGetThemeColor = mock.fn(() => 'default' as const)
  const mockGetThemeMode = mock.fn(() => 'system' as const)
  const mockNavigate = mock.fn()
  const mockSetFontPairing = mock.fn()
  const mockSetThemeColor = mock.fn()
  const mockSetThemeMode = mock.fn()
  const mockToggleSoundPreference = mock.fn(() => 'on' as const)

  return {
    deps: {
      findEasterEgg: mockFindEasterEgg,
      getEasterEggCatalog: mockGetEasterEggCatalog,
      getFontPairing: mockGetFontPairing,
      getFoundEasterEggIds: mockGetFoundEasterEggIds,
      getSoundPreference: mockGetSoundPreference,
      getThemeColor: mockGetThemeColor,
      getThemeMode: mockGetThemeMode,
      navigate: mockNavigate,
      setFontPairing: mockSetFontPairing,
      setThemeColor: mockSetThemeColor,
      setThemeMode: mockSetThemeMode,
      toggleSoundPreference: mockToggleSoundPreference,
      ...overrides,
    },
    mockFindEasterEgg,
    mockNavigate,
    mockSetFontPairing,
    mockSetThemeColor,
    mockSetThemeMode,
    mockToggleSoundPreference,
  }
}

function isToolError(
  result: unknown,
): result is { code: string; error: string; retryable: boolean } {
  return Boolean(result && typeof result === 'object' && 'error' in result)
}

describe('theme color and mode enums', () => {
  test('match the site theme constants', () => {
    assert.deepEqual([...THEME_COLOR_VALUES].toSorted(), [...THEME_COLORS].toSorted())
    assert.deepEqual([...THEME_MODE_VALUES].toSorted(), [...THEME_MODES].toSorted())
  })
})

describe('font pairing enum', () => {
  test('matches the selectable font pairings', () => {
    assert.deepEqual([...FONT_PAIRING_VALUES].toSorted(), [...FONT_PAIRINGS].toSorted())
  })
})

describe('secret id enum', () => {
  test('matches the catalog fixture', () => {
    assert.deepEqual(
      CATALOG.map((secret) => secret.id),
      [...SECRET_IDS],
    )
  })
})

describe('handleSetTheme', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('applies mode and color', () => {
    const { deps, mockSetThemeColor, mockSetThemeMode } = createDeps({
      getThemeColor: () => 'blue',
      getThemeMode: () => 'dark',
    })

    const result = handleSetTheme(deps, { color: 'blue', mode: 'dark' })

    assert.equal(result, 'Appearance is now dark. Color is now blue.')
    assert.equal(mockSetThemeMode.mock.calls.length, 1)
    assert.deepEqual(mockSetThemeMode.mock.calls[0]?.arguments, ['dark'])
    assert.equal(mockSetThemeColor.mock.calls.length, 1)
    assert.deepEqual(mockSetThemeColor.mock.calls[0]?.arguments, ['blue'])
  })

  test('applies only the provided field', () => {
    const { deps, mockSetThemeColor, mockSetThemeMode } = createDeps({
      getThemeMode: () => 'light',
    })

    const result = handleSetTheme(deps, { mode: 'light' })

    assert.equal(result, 'Appearance is now light.')
    assert.equal(mockSetThemeMode.mock.calls.length, 1)
    assert.equal(mockSetThemeColor.mock.calls.length, 0)
  })

  test('rejects missing mode and color', () => {
    const result = handleSetTheme(createDeps().deps, {})

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'INVALID_INPUT')
    assert.match(result.error, /mode/i)
  })

  test('rejects an unknown color', () => {
    const { deps, mockSetThemeColor } = createDeps()
    const result = handleSetTheme(deps, { color: 'hotpink' })

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'INVALID_INPUT')
    assert.equal(mockSetThemeColor.mock.calls.length, 0)
  })
})

describe('handleSetFontPairing', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('applies a known pairing', () => {
    const { deps, mockSetFontPairing } = createDeps()
    const result = handleSetFontPairing(deps, { pairing: 'work' })

    assert.equal(result, 'Font pairing is now work.')
    assert.deepEqual(mockSetFontPairing.mock.calls[0]?.arguments, ['work'])
  })

  test('rejects an unknown pairing', () => {
    const { deps, mockSetFontPairing } = createDeps()
    const result = handleSetFontPairing(deps, { pairing: 'comic' })

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'INVALID_INPUT')
    assert.equal(mockSetFontPairing.mock.calls.length, 0)
  })
})

describe('handleToggleSound', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('toggles the current preference', () => {
    const mockToggleSoundPreference = mock.fn(() => 'off' as const)
    const { deps } = createDeps({
      toggleSoundPreference: mockToggleSoundPreference,
    })

    assert.equal(handleToggleSound(deps), 'Sounds are now off.')
    assert.equal(mockToggleSoundPreference.mock.calls.length, 1)
  })
})

describe('handleNavigateToPage', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('navigates to a known page', async () => {
    const { deps, mockNavigate } = createDeps()
    const result = await handleNavigateToPage(deps, { page: '/resume' })

    assert.equal(result, 'Opened Resume (/resume).')
    assert.deepEqual(mockNavigate.mock.calls[0]?.arguments, ['/resume'])
  })

  test('rejects an unknown page', async () => {
    const { deps, mockNavigate } = createDeps()
    const result = await handleNavigateToPage(deps, { page: '/admin' })

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'UNKNOWN_PAGE')
    assert.equal(mockNavigate.mock.calls.length, 0)
  })
})

describe('handleListSecrets', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('returns names, hints, and found status without solutions', () => {
    const { deps } = createDeps({
      getFoundEasterEggIds: () => ['hyrule'],
    })
    const result = handleListSecrets(deps)

    assert.equal(typeof result, 'string')
    if (typeof result !== 'string') {
      return
    }

    assert.match(result, /Secrets: 1 of 3 found/)
    assert.match(result, /Aurora \(unfound\)/)
    assert.match(result, /Hyrule \(found\)/)
    assert.match(result, /Lamp \(unfound\)/)
    assert.match(result, /A little song still sleeps in the keys/)

    const leaked = SOLUTION_LEAKS.filter((token) => {
      return result.toLowerCase().includes(token.toLowerCase())
    })

    assert.deepEqual(leaked, [])
    assert.equal(result.includes('solution'), false)
  })
})

describe('handleFindSecret', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('unlocks a named secret', async () => {
    const mockFindEasterEgg = mock.fn(async () => ({
      alreadyActive: false,
      id: 'aurora',
      name: 'Aurora',
    }))
    const { deps } = createDeps({
      findEasterEgg: mockFindEasterEgg,
    })
    const result = await handleFindSecret(deps, { name: 'aurora' })

    assert.equal(result, 'Found Aurora. Its effect is in play.')
    assert.deepEqual(mockFindEasterEgg.mock.calls[0]?.arguments, ['aurora'])
  })

  test('says when the secret is already in play', async () => {
    const { deps } = createDeps({
      findEasterEgg: async () => ({
        alreadyActive: true,
        id: 'lamp',
        name: 'Lamp',
      }),
    })
    const result = await handleFindSecret(deps, { name: 'lamp' })

    assert.equal(result, 'Lamp is already in play.')
  })

  test('rejects an unknown secret without leaking solutions', async () => {
    const mockFindEasterEgg = mock.fn(async () => undefined)
    const { deps } = createDeps({
      findEasterEgg: mockFindEasterEgg,
    })
    const result = await handleFindSecret(deps, { name: 'konami' })

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'UNKNOWN_SECRET')
    assert.equal(mockFindEasterEgg.mock.calls.length, 0)
    assert.equal(JSON.stringify(result).toLowerCase().includes('arrowup'), false)
  })
})
