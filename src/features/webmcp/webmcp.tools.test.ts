import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { getEasterEggCatalog } from '@/components/EasterEggs/easter-eggs.ts'
import { FONT_PAIRING_CONFIGS } from '@/components/Settings/Font/pairings.ts'
import { toPagePath } from '@/utils/content.ts'

import {
  createWebMcpTools,
  type WebMcpPage,
  type WebMcpToolDeps,
  type WebMcpToolError,
  type WebMcpToolResult,
} from './webmcp.tools.ts'
import { createWebMcpDeps } from './webmcp.ts'
import { toHomePage, toWebMcpPages } from './webmcp.utils.ts'

const PAGES: readonly WebMcpPage[] = toWebMcpPages(
  [
    { href: '/resume', name: 'Resume' },
    { href: '/tread-talks', name: 'TREAD Talks' },
  ],
  toHomePage({ data: { title: 'Greetings' }, id: 'index' }),
)

const SOLUTION_LEAKS = ['ArrowUp', 'KeyA', 'konami', 'sequence']

const INVALID_INPUT_CASES = [
  { code: 'INVALID_INPUT', input: { color: 'hotpink' }, name: 'set_theme' },
  { code: 'INVALID_INPUT', input: { pairing: 'comic' }, name: 'set_font_pairing' },
  { code: 'INVALID_INPUT', input: {}, name: 'set_sound' },
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
  const mockSetSoundPreference = mock.fn((enabled: boolean) => {
    sound = enabled ? 'on' : 'off'

    return sound
  })
  const mockSetThemeColor = mock.fn((next: typeof color) => {
    color = next
  })
  const mockSetThemeMode = mock.fn((next: typeof mode) => {
    mode = next
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
      setSoundPreference: mockSetSoundPreference,
      setThemeColor: mockSetThemeColor,
      setThemeMode: mockSetThemeMode,
      ...overrides,
    }),
    mockFindEasterEgg,
    mockNavigate,
    mockSetFontPairing,
    mockSetSoundPreference,
    mockSetThemeColor,
    mockSetThemeMode,
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

function getEnum(tool: { inputSchema: { properties?: object } }, key: string) {
  const properties = tool.inputSchema.properties as
    Record<string, { enum?: string[] } | undefined> | undefined

  return properties?.[key]?.enum
}

function isToolError(result: unknown): result is WebMcpToolError {
  return Boolean(result && typeof result === 'object' && 'error' in result)
}

function mutationCount(spies: {
  mockFindEasterEgg: { mock: { calls: unknown[] } }
  mockNavigate: { mock: { calls: unknown[] } }
  mockSetFontPairing: { mock: { calls: unknown[] } }
  mockSetSoundPreference: { mock: { calls: unknown[] } }
  mockSetThemeColor: { mock: { calls: unknown[] } }
  mockSetThemeMode: { mock: { calls: unknown[] } }
}) {
  return (
    spies.mockFindEasterEgg.mock.calls.length +
    spies.mockNavigate.mock.calls.length +
    spies.mockSetFontPairing.mock.calls.length +
    spies.mockSetSoundPreference.mock.calls.length +
    spies.mockSetThemeColor.mock.calls.length +
    spies.mockSetThemeMode.mock.calls.length
  )
}

describe('createWebMcpTools', () => {
  test('builds page and secret schemas from deps', () => {
    const catalog = [{ hint: 'Skyward', id: 'nova', name: 'Nova' }]
    const pages = [{ href: '/new-page', name: 'New Page' }]
    const tools = createWebMcpTools(
      createDeps({
        getEasterEggCatalog: () => {
          return catalog
        },
        pages,
      }).deps,
    )
    const navigate = tools.find((entry) => {
      return entry.name === 'navigate_to_page'
    })
    const findSecret = tools.find((entry) => {
      return entry.name === 'find_secret'
    })

    assert.ok(navigate)
    assert.ok(findSecret)
    assert.deepEqual(getEnum(navigate, 'page'), ['/new-page'])
    assert.deepEqual(getEnum(findSecret, 'name'), ['nova'])
  })

  test('keeps tool descriptions generic and uses secret instead of surprise', () => {
    const tools = createWebMcpTools(createDeps().deps)
    const findSecret = tools.find((entry) => {
      return entry.name === 'find_secret'
    })

    assert.ok(findSecret)
    assert.match(findSecret.description, /effect/i)
    assert.match(findSecret.description, /found/i)

    for (const tool of tools) {
      assert.ok(tool.name.length <= 30, tool.name)
      assert.ok(tool.description.length <= 500, tool.name)
      assert.equal(/surprise/i.test(tool.description), false, tool.name)

      for (const pairing of FONT_PAIRING_CONFIGS) {
        assert.equal(tool.description.includes(pairing.id), false, tool.name)
      }

      const properties = 'properties' in tool.inputSchema ? tool.inputSchema.properties : {}

      for (const [key, property] of Object.entries(properties)) {
        if (!property || typeof property !== 'object' || !('description' in property)) {
          continue
        }

        assert.ok(String(property.description).length <= 150, `${tool.name}.${key}`)
      }
    }
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

  test('returns a clear error when mode and color are omitted', async () => {
    const { deps } = createDeps()
    const result = await executeTool(deps, 'set_theme', {})

    assert.equal(isToolError(result), true)
    if (!isToolError(result)) {
      return
    }

    assert.equal(result.code, 'INVALID_INPUT')
    assert.match(result.error, /mode/i)
    assert.match(result.error, /color/i)
  })
})

describe('set_font_pairing', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('applies a known pairing', async () => {
    const { deps } = createDeps()
    const pairing = FONT_PAIRING_CONFIGS[0]

    assert.ok(pairing)

    const result = await executeTool(deps, 'set_font_pairing', { pairing: pairing.id })

    assert.equal(result, `Font pairing is now ${pairing.label}.`)
    assert.equal(deps.getFontPairing(), pairing.id)
  })
})

describe('set_sound', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('sets the requested state without toggling', async () => {
    const { deps } = createDeps()

    assert.equal(await executeTool(deps, 'set_sound', { enabled: true }), 'Sounds are now on.')
    assert.equal(deps.getSoundPreference(), 'on')
    assert.equal(await executeTool(deps, 'set_sound', { enabled: true }), 'Sounds are now on.')
    assert.equal(deps.getSoundPreference(), 'on')
    assert.equal(await executeTool(deps, 'set_sound', { enabled: false }), 'Sounds are now off.')
    assert.equal(deps.getSoundPreference(), 'off')
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

  test('navigates to the home page', async () => {
    const { deps, mockNavigate } = createDeps()
    const home = toPagePath('index')
    const result = await executeTool(deps, 'navigate_to_page', { page: home })

    assert.equal(result, `Opened Greetings (${home}).`)
    assert.equal(mockNavigate.mock.calls.length, 1)
  })
})

describe('list_secrets', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('lists the real catalog without leaking solutions', async () => {
    const catalog = getEasterEggCatalog()
    const foundId = catalog[1]?.id
    const deps = createWebMcpDeps({
      getFoundEasterEggIds: () => {
        return foundId ? [foundId] : []
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

    assert.match(result, new RegExp(`Secrets: 1 of ${catalog.length} found`))

    for (const secret of catalog) {
      const status = secret.id === foundId ? 'found' : 'unfound'

      assert.match(result, new RegExp(`${secret.name} \\(${status}\\)`))
      assert.equal(result.includes(secret.hint), true)
    }

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
    const secret = getEasterEggCatalog()[0]

    assert.ok(secret)

    const result = await executeTool(deps, 'find_secret', { name: secret.id })

    assert.equal(result, `Found ${secret.name}. Its effect is in play.`)
  })

  test('says when the secret is already in play', async () => {
    const secret = getEasterEggCatalog().at(-1)

    assert.ok(secret)

    const { deps } = createDeps({
      findEasterEgg: async () => {
        return {
          alreadyActive: true,
          id: secret.id,
          name: secret.name,
        }
      },
    })
    const result = await executeTool(deps, 'find_secret', { name: secret.id })

    assert.equal(result, `${secret.name} is already in play.`)
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
