import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import {
  createWebMcpTools,
  type WebMcpPage,
  type WebMcpToolDeps,
  type WebMcpToolError,
  type WebMcpToolResult,
} from './webmcp.tools.ts'
import { createWebMcpDeps } from './webmcp.ts'

const PAGES: readonly WebMcpPage[] = [
  { href: '/resume', name: 'Resume' },
  { href: '/tread-talks', name: 'TREAD Talks' },
]

const SOLUTION_LEAKS = ['ArrowUp', 'KeyA', 'konami', 'sequence']

const INVALID_INPUT_CASES = [
  { code: 'INVALID_INPUT', input: {}, name: 'set_theme' },
  { code: 'INVALID_INPUT', input: { color: 'hotpink' }, name: 'set_theme' },
  { code: 'INVALID_INPUT', input: { pairing: 'comic' }, name: 'set_font_pairing' },
  { code: 'UNKNOWN_PAGE', input: { page: '/admin' }, name: 'navigate_to_page' },
  { code: 'UNKNOWN_SECRET', input: { name: 'konami' }, name: 'find_secret' },
] as const

function createDeps(overrides: Partial<WebMcpToolDeps> = {}) {
  let color: ReturnType<WebMcpToolDeps['getThemeColor']> = 'default'
  let font: ReturnType<WebMcpToolDeps['getFontPairing']> = 'default'
  let mode: ReturnType<WebMcpToolDeps['getThemeMode']> = 'system'
  let sound: ReturnType<WebMcpToolDeps['getSoundPreference']> = 'off'
  const mockFindEasterEgg = mock.fn(async (id: string) => {
    return {
      alreadyActive: false,
      id,
      name: `${id.slice(0, 1).toUpperCase()}${id.slice(1)}`,
    }
  })
  const mockNavigate = mock.fn()
  const mockSetFontPairing = mock.fn((pairing: typeof font) => {
    font = pairing
  })
  const mockSetThemeColor = mock.fn((next: typeof color) => {
    color = next
  })
  const mockSetThemeMode = mock.fn((next: typeof mode) => {
    mode = next
  })
  const mockToggleSoundPreference = mock.fn(() => {
    sound = sound === 'on' ? 'off' : 'on'

    return sound
  })

  return {
    deps: createWebMcpDeps({
      findEasterEgg: mockFindEasterEgg,
      getFontPairing: () => {
        return font
      },
      getSoundPreference: () => {
        return sound
      },
      getThemeColor: () => {
        return color
      },
      getThemeMode: () => {
        return mode
      },
      navigate: mockNavigate,
      pages: PAGES,
      setFontPairing: mockSetFontPairing,
      setThemeColor: mockSetThemeColor,
      setThemeMode: mockSetThemeMode,
      toggleSoundPreference: mockToggleSoundPreference,
      ...overrides,
    }),
    mockFindEasterEgg,
    mockNavigate,
    mockSetFontPairing,
    mockSetThemeColor,
    mockSetThemeMode,
    mockToggleSoundPreference,
  }
}

async function executeTool(
  deps: WebMcpToolDeps,
  name: string,
  input: Record<string, unknown> = {},
) {
  const tool = createWebMcpTools(deps).find((entry) => {
    return entry.name === name
  })

  assert.ok(tool, `missing tool ${name}`)

  return tool.execute(input) as Promise<WebMcpToolResult> | WebMcpToolResult
}

function isToolError(result: unknown): result is WebMcpToolError {
  return Boolean(result && typeof result === 'object' && 'error' in result)
}

function mutationCount(spies: {
  mockFindEasterEgg: { mock: { calls: unknown[] } }
  mockNavigate: { mock: { calls: unknown[] } }
  mockSetFontPairing: { mock: { calls: unknown[] } }
  mockSetThemeColor: { mock: { calls: unknown[] } }
  mockSetThemeMode: { mock: { calls: unknown[] } }
  mockToggleSoundPreference: { mock: { calls: unknown[] } }
}) {
  return (
    spies.mockFindEasterEgg.mock.calls.length +
    spies.mockNavigate.mock.calls.length +
    spies.mockSetFontPairing.mock.calls.length +
    spies.mockSetThemeColor.mock.calls.length +
    spies.mockSetThemeMode.mock.calls.length +
    spies.mockToggleSoundPreference.mock.calls.length
  )
}

describe('createWebMcpTools', () => {
  test('builds the navigate enum from the palette page list', () => {
    const pages = [
      { href: '/resume', name: 'Resume' },
      { href: '/new-page', name: 'New Page' },
    ]
    const tool = createWebMcpTools(createDeps({ pages }).deps).find((entry) => {
      return entry.name === 'navigate_to_page'
    })
    const schema = tool?.inputSchema as {
      properties?: { page?: { enum?: readonly string[] } }
    }

    assert.ok(tool)
    assert.deepEqual(schema.properties?.page?.enum, ['/resume', '/new-page'])
  })
})

describe('set_theme', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('applies mode and color', async () => {
    const { deps } = createDeps()
    const result = await executeTool(deps, 'set_theme', { color: 'blue', mode: 'dark' })

    assert.equal(result, 'Appearance is now dark. Color is now blue.')
    assert.equal(deps.getThemeMode(), 'dark')
    assert.equal(deps.getThemeColor(), 'blue')
  })

  test('applies only the provided field', async () => {
    const { deps } = createDeps()
    const result = await executeTool(deps, 'set_theme', { mode: 'light' })

    assert.equal(result, 'Appearance is now light.')
    assert.equal(deps.getThemeMode(), 'light')
    assert.equal(deps.getThemeColor(), 'default')
  })
})

describe('set_font_pairing', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('applies a known pairing', async () => {
    const { deps } = createDeps()
    const result = await executeTool(deps, 'set_font_pairing', { pairing: 'work' })

    assert.equal(result, 'Font pairing is now work.')
    assert.equal(deps.getFontPairing(), 'work')
  })
})

describe('toggle_sound', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('toggles the current preference', async () => {
    const { deps } = createDeps()

    assert.equal(await executeTool(deps, 'toggle_sound'), 'Sounds are now on.')
    assert.equal(deps.getSoundPreference(), 'on')
  })
})

describe('navigate_to_page', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('navigates to a known page', async () => {
    const { deps, mockNavigate } = createDeps()
    const result = await executeTool(deps, 'navigate_to_page', { page: '/resume' })

    assert.equal(result, 'Opened Resume (/resume).')
    assert.equal(mockNavigate.mock.calls.length, 1)
  })
})

describe('list_secrets', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('lists the real catalog without leaking solutions', async () => {
    const deps = createWebMcpDeps({
      getFoundEasterEggIds: () => {
        return ['hyrule']
      },
      navigate: () => {
        return undefined
      },
      pages: PAGES,
    })
    const result = await executeTool(deps, 'list_secrets')

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
  })
})

describe('find_secret', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('unlocks a named secret', async () => {
    const { deps } = createDeps()
    const result = await executeTool(deps, 'find_secret', { name: 'aurora' })

    assert.equal(result, 'Found Aurora. Its effect is in play.')
  })

  test('says when the secret is already in play', async () => {
    const { deps } = createDeps({
      findEasterEgg: async () => {
        return {
          alreadyActive: true,
          id: 'lamp',
          name: 'Lamp',
        }
      },
    })
    const result = await executeTool(deps, 'find_secret', { name: 'lamp' })

    assert.equal(result, 'Lamp is already in play.')
  })
})

describe('invalid tool input', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('rejects bad input without side effects', async () => {
    for (const { code, input, name } of INVALID_INPUT_CASES) {
      const spies = createDeps()
      const result = await executeTool(spies.deps, name, { ...input })

      assert.equal(isToolError(result), true, name)
      if (!isToolError(result)) {
        continue
      }

      assert.equal(result.code, code, name)
      assert.equal(mutationCount(spies), 0, name)
    }
  })
})
