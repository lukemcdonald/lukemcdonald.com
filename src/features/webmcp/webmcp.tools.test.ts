import type { MenuLinkItem } from '@/features/navigation/navigation.types.ts'

import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import { getEasterEggCatalog } from '@/components/EasterEggs/easter-eggs.ts'
import { FONT_PAIRING_CONFIGS } from '@/components/Settings/Font/pairings.ts'
import { RESUME_LINK } from '@/features/navigation/navigation.utils.ts'
import { toPagePath } from '@/utils/content.ts'

import {
  createWebMcpTools,
  type WebMcpToolDeps,
  type WebMcpToolError,
  type WebMcpToolResult,
} from './webmcp.tools.ts'
import { createWebMcpDeps } from './webmcp.ts'
import { toWebMcpPages } from './webmcp.utils.ts'

const PAGES: readonly MenuLinkItem[] = toWebMcpPages([RESUME_LINK], { id: 'index' })

function createDeps(overrides: Partial<WebMcpToolDeps> = {}): WebMcpToolDeps {
  let color: ReturnType<WebMcpToolDeps['getThemeColor']> = 'default'
  let font: ReturnType<WebMcpToolDeps['getFontPairing']> = 'default'
  let mode: ReturnType<WebMcpToolDeps['getThemeMode']> = 'system'
  let sound: ReturnType<WebMcpToolDeps['getSoundPreference']> = 'off'

  return createWebMcpDeps({
    findEasterEgg: async (id) => {
      return {
        alreadyActive: false,
        id,
        name: `${id.slice(0, 1).toUpperCase()}${id.slice(1)}`,
      }
    },
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
    navigate: () => {
      return undefined
    },
    pages: PAGES,
    setFontPairing: (pairing) => {
      font = pairing
    },
    setSoundPreference: (enabled) => {
      sound = enabled ? 'on' : 'off'

      return sound
    },
    setThemeColor: (next) => {
      color = next
    },
    setThemeMode: (next) => {
      mode = next
    },
    ...overrides,
  })
}

async function executeTool(
  deps: WebMcpToolDeps,
  name: string,
  input: Record<string, unknown> = {},
) {
  return getTool(deps, name).execute(input) as Promise<WebMcpToolResult> | WebMcpToolResult
}

function getTool(deps: WebMcpToolDeps, name: string) {
  const tool = createWebMcpTools(deps).find((entry) => {
    return entry.name === name
  })

  assert.ok(tool, `missing tool ${name}`)

  return tool
}

function isToolError(result: unknown): result is WebMcpToolError {
  return Boolean(result && typeof result === 'object' && 'error' in result)
}

function schemaProperty(deps: WebMcpToolDeps, toolName: string, key: string) {
  const properties = getTool(deps, toolName).inputSchema.properties as
    | Record<
        string,
        | { enum?: string[]; oneOf?: { const: string; description?: string; title?: string }[] }
        | undefined
      >
    | undefined

  return properties?.[key]
}

describe('webmcp tools', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  describe('createWebMcpTools', () => {
    test('builds page and secret schemas from the given lists', () => {
      const deps = createDeps({
        getEasterEggCatalog: () => {
          return [{ hint: 'Skyward', id: 'ember', name: 'Campfire' }]
        },
        pages: [{ href: '/new-page', name: 'New Page' }],
      })
      const page = schemaProperty(deps, 'navigate_to_page', 'page')
      const secret = schemaProperty(deps, 'find_secret', 'name')

      assert.deepEqual(
        page?.oneOf?.map((entry) => {
          return entry.const
        }),
        ['/new-page'],
      )
      assert.equal(page?.oneOf?.[0]?.title, 'New Page')
      assert.deepEqual(secret?.enum, ['ember'])
      assert.equal(JSON.stringify(secret).includes('Skyward'), false)
    })

    test('describes each font pairing from FONT_PAIRING_CONFIGS', () => {
      const pairing = schemaProperty(createDeps(), 'set_font_pairing', 'pairing')

      for (const config of FONT_PAIRING_CONFIGS) {
        const choice = pairing?.oneOf?.find((entry) => {
          return entry.const === config.id
        })

        assert.equal(choice?.title, config.label)
        assert.equal((choice?.description ?? '').includes(config.heading.name), true)
        assert.equal((choice?.description ?? '').includes(config.body.name), true)
      }
    })

    test('lists catalog secret ids without hints and titles the home page', () => {
      const deps = createDeps()
      const secret = schemaProperty(deps, 'find_secret', 'name')
      const page = schemaProperty(deps, 'navigate_to_page', 'page')
      const catalog = getEasterEggCatalog()

      assert.deepEqual(
        secret?.enum,
        catalog.map((item) => {
          return item.id
        }),
      )
      assert.equal(
        catalog.some((item) => {
          return JSON.stringify(secret).includes(item.hint)
        }),
        false,
      )
      assert.equal(
        page?.oneOf?.find((entry) => {
          return entry.const === toPagePath('index')
        })?.title,
        'Home',
      )
    })
  })

  describe('set_theme', () => {
    test('applies mode and color', async () => {
      const deps = createDeps()
      const result = await executeTool(deps, 'set_theme', { color: 'blue', mode: 'dark' })

      assert.equal(result, 'Appearance is now dark. Color is now blue.')
      assert.equal(deps.getThemeMode(), 'dark')
      assert.equal(deps.getThemeColor(), 'blue')
    })

    test('applies only the provided field', async () => {
      const deps = createDeps()
      const result = await executeTool(deps, 'set_theme', { mode: 'light' })

      assert.equal(result, 'Appearance is now light.')
      assert.equal(deps.getThemeMode(), 'light')
      assert.equal(deps.getThemeColor(), 'default')
    })

    test('returns a clear error when mode and color are omitted', async () => {
      const result = await executeTool(createDeps(), 'set_theme', {})

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
    test('applies a known pairing', async () => {
      const deps = createDeps()
      const pairing = FONT_PAIRING_CONFIGS[0]

      assert.ok(pairing)

      const result = await executeTool(deps, 'set_font_pairing', { pairing: pairing.id })

      assert.equal(result, `Font pairing is now ${pairing.label}.`)
      assert.equal(deps.getFontPairing(), pairing.id)
    })
  })

  describe('set_sound', () => {
    test('sets the requested state without toggling', async () => {
      const deps = createDeps()

      assert.equal(await executeTool(deps, 'set_sound', { enabled: true }), 'Sounds are now on.')
      assert.equal(deps.getSoundPreference(), 'on')
      assert.equal(await executeTool(deps, 'set_sound', { enabled: true }), 'Sounds are now on.')
      assert.equal(deps.getSoundPreference(), 'on')
      assert.equal(await executeTool(deps, 'set_sound', { enabled: false }), 'Sounds are now off.')
      assert.equal(deps.getSoundPreference(), 'off')
    })
  })

  describe('navigate_to_page', () => {
    test('navigates to a known page', async () => {
      const navigate = mock.fn()
      const result = await executeTool(createDeps({ navigate }), 'navigate_to_page', {
        page: RESUME_LINK.href,
      })

      assert.equal(result, `Opened ${RESUME_LINK.name} (${RESUME_LINK.href}).`)
      assert.equal(navigate.mock.calls.length, 1)
    })
  })

  describe('list_secrets', () => {
    test('lists the real catalog without leaking solutions', async () => {
      const catalog = getEasterEggCatalog()
      const foundId = catalog[1]?.id
      const result = await executeTool(
        createDeps({
          getFoundEasterEggIds: () => {
            return foundId ? [foundId] : []
          },
        }),
        'list_secrets',
      )

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

      assert.equal(/arrowup|keya|konami|sequence/i.test(result), false)
    })
  })

  describe('find_secret', () => {
    test('unlocks a named secret', async () => {
      const secret = getEasterEggCatalog()[0]

      assert.ok(secret)

      const result = await executeTool(createDeps(), 'find_secret', { name: secret.id })

      assert.equal(result, `Found ${secret.name}. Its effect is in play.`)
    })

    test('says when the secret is already in play', async () => {
      const secret = getEasterEggCatalog().at(-1)

      assert.ok(secret)

      const result = await executeTool(
        createDeps({
          findEasterEgg: async () => {
            return {
              alreadyActive: true,
              id: secret.id,
              name: secret.name,
            }
          },
        }),
        'find_secret',
        { name: secret.id },
      )

      assert.equal(result, `${secret.name} is already in play.`)
    })
  })

  describe('invalid tool input', () => {
    test('rejects bad input', async () => {
      const cases = [
        { code: 'INVALID_INPUT', input: { color: 'hotpink' }, name: 'set_theme' },
        { code: 'INVALID_INPUT', input: { pairing: 'comic' }, name: 'set_font_pairing' },
        { code: 'INVALID_INPUT', input: {}, name: 'set_sound' },
        { code: 'UNKNOWN_PAGE', input: { page: '/admin' }, name: 'navigate_to_page' },
        { code: 'UNKNOWN_SECRET', input: { name: 'konami' }, name: 'find_secret' },
      ] as const

      for (const { code, input, name } of cases) {
        const result = await executeTool(createDeps(), name, { ...input })

        assert.equal(isToolError(result), true, name)
        if (!isToolError(result)) {
          continue
        }

        assert.equal(result.code, code, name)
      }
    })
  })
})
