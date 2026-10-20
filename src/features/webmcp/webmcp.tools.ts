import type { FontPairing } from '@/components/Settings/Font/font'
import type { SoundPreference } from '@/components/Settings/Sound/types'
import type { ThemeColor } from '@/components/Settings/ThemeColor/types'
import type { ThemeMode } from '@/components/Settings/ThemeMode/types'

import { EASTER_EGG_IDS } from '@/components/EasterEggs/easter-eggs'
import { FONT_PAIRINGS } from '@/components/Settings/Font/pairings'
import { THEME_COLORS, THEME_LABELS } from '@/components/Settings/ThemeColor/constants'
import { isThemeColor } from '@/components/Settings/ThemeColor/utils'
import { MODE_LABELS, THEME_MODES } from '@/components/Settings/ThemeMode/constants'
import { isThemeMode } from '@/components/Settings/ThemeMode/utils'

const EMPTY_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {},
  type: 'object',
} as const

const WEBMCP_OUTPUT_MAX = 1500

export type WebMcpPage = {
  href: string
  name: string
}

export type WebMcpSecret = {
  hint: string
  id: string
  name: string
}

export type WebMcpToolDeps = {
  findEasterEgg: (id: string) => Promise<{ alreadyActive: boolean; id: string; name: string }>
  getEasterEggCatalog: () => readonly WebMcpSecret[]
  getFontPairing: () => FontPairing
  getFoundEasterEggIds: () => readonly string[]
  getSoundPreference: () => SoundPreference
  getThemeColor: () => ThemeColor
  getThemeMode: () => ThemeMode
  navigate: (href: string) => void | Promise<void>
  pages: readonly WebMcpPage[]
  setFontPairing: (pairing: FontPairing) => void
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleSoundPreference: () => SoundPreference
}

export type WebMcpToolError = {
  code: string
  error: string
  retryable: boolean
  suggestion?: string
}

export type WebMcpToolResult = string | WebMcpToolError

export function createWebMcpTools(deps: WebMcpToolDeps) {
  const pageHrefs = deps.pages.map((page) => {
    return page.href
  })

  return [
    {
      description:
        'Sets the site appearance and color. Use when the visitor wants a light, dark, or system look, or a different theme color.',
      execute: (input: { color?: string; mode?: string }) => {
        return handleSetTheme(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          color: {
            description: "One of the site's theme colors.",
            enum: THEME_COLORS,
            type: 'string',
          },
          mode: {
            description: 'Light, dark, or match the system appearance.',
            enum: THEME_MODES,
            type: 'string',
          },
        },
        type: 'object',
      } as const,
      name: 'set_theme',
    },
    {
      description:
        "Applies a work, play, or live font pairing. Use when the visitor wants to change the site's fonts.",
      execute: (input: { pairing?: string }) => {
        return handleSetFontPairing(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          pairing: {
            description: 'Work, play, or live font pairing.',
            enum: FONT_PAIRINGS,
            type: 'string',
          },
        },
        required: ['pairing'],
        type: 'object',
      } as const,
      name: 'set_font_pairing',
    },
    {
      description:
        'Turns interaction sounds on or off. Use when the visitor wants to mute or unmute UI sounds.',
      execute: () => {
        return handleToggleSound(deps)
      },
      inputSchema: EMPTY_INPUT_SCHEMA,
      name: 'toggle_sound',
    },
    {
      description:
        "Opens one of the site's pages. Use when the visitor wants to go to a specific page.",
      execute: (input: { page?: string }) => {
        return handleNavigateToPage(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          page: {
            description: 'Path of the page to open.',
            enum: pageHrefs,
            type: 'string',
          },
        },
        required: ['page'],
        type: 'object',
      } as const,
      name: 'navigate_to_page',
    },
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        'Lists hidden surprises with a hint and whether each has been found. Use when the visitor asks what secrets exist or which are still undiscovered.',
      execute: () => {
        return handleListSecrets(deps)
      },
      inputSchema: EMPTY_INPUT_SCHEMA,
      name: 'list_secrets',
    },
    {
      description:
        'Unlocks a named hidden surprise and plays its effect. Use when the visitor wants to find a secret by name.',
      execute: (input: { name?: string }) => {
        return handleFindSecret(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          name: {
            description: 'Name of the secret to unlock.',
            enum: EASTER_EGG_IDS,
            type: 'string',
          },
        },
        required: ['name'],
        type: 'object',
      } as const,
      name: 'find_secret',
    },
  ]
}

function clipToolOutput(payload: string) {
  if (payload.length <= WEBMCP_OUTPUT_MAX) {
    return payload
  }

  return `${payload.slice(0, WEBMCP_OUTPUT_MAX - 1)}...`
}

function formatThemeResult(mode?: ThemeMode, color?: ThemeColor) {
  const parts: string[] = []

  if (mode !== undefined) {
    parts.push(`Appearance is now ${MODE_LABELS[mode].toLowerCase()}.`)
  }

  if (color !== undefined) {
    parts.push(`Color is now ${THEME_LABELS[color].toLowerCase()}.`)
  }

  return parts.join(' ')
}

async function handleFindSecret(
  deps: WebMcpToolDeps,
  input: { name?: string },
): Promise<WebMcpToolResult> {
  const name = input.name

  if (!isOneOf(EASTER_EGG_IDS, name)) {
    return toToolError(
      'UNKNOWN_SECRET',
      name ? `Unknown secret "${name}".` : 'Provide a secret name.',
      `Use one of: ${EASTER_EGG_IDS.join(', ')}.`,
    )
  }

  const result = await deps.findEasterEgg(name)

  if (result.alreadyActive) {
    return `${result.name} is already in play.`
  }

  return `Found ${result.name}. Its effect is in play.`
}

function handleListSecrets(deps: WebMcpToolDeps): WebMcpToolResult {
  const catalog = deps.getEasterEggCatalog()
  const foundIds = new Set(deps.getFoundEasterEggIds())
  const lines = catalog.map((secret) => {
    const found = foundIds.has(secret.id)

    return `- ${secret.name} (${found ? 'found' : 'unfound'}): ${secret.hint}`
  })
  const foundCount = catalog.filter((secret) => foundIds.has(secret.id)).length
  const payload = [`Secrets: ${foundCount} of ${catalog.length} found.`, ...lines].join('\n')

  return clipToolOutput(payload)
}

async function handleNavigateToPage(
  deps: WebMcpToolDeps,
  input: { page?: string },
): Promise<WebMcpToolResult> {
  const page = input.page
  const hrefs = deps.pages.map((item) => {
    return item.href
  })

  if (!isOneOf(hrefs, page)) {
    return toToolError(
      'UNKNOWN_PAGE',
      page ? `Unknown page "${page}".` : 'Provide a page path.',
      `Use one of: ${hrefs.join(', ')}.`,
    )
  }

  await deps.navigate(page)

  const title =
    deps.pages.find((item) => {
      return item.href === page
    })?.name ?? page

  return `Opened ${title} (${page}).`
}

function handleSetFontPairing(deps: WebMcpToolDeps, input: { pairing?: string }): WebMcpToolResult {
  const pairing = input.pairing

  if (!isOneOf(FONT_PAIRINGS, pairing)) {
    return toToolError(
      'INVALID_INPUT',
      pairing ? `Unknown font pairing "${pairing}".` : 'Provide a font pairing.',
      `Use one of: ${FONT_PAIRINGS.join(', ')}.`,
    )
  }

  deps.setFontPairing(pairing)

  return `Font pairing is now ${pairing}.`
}

function handleSetTheme(
  deps: WebMcpToolDeps,
  input: { color?: string; mode?: string },
): WebMcpToolResult {
  const color = input.color
  const mode = input.mode

  if (color === undefined && mode === undefined) {
    return toToolError(
      'INVALID_INPUT',
      'Provide a mode, a color, or both.',
      `Modes: ${THEME_MODES.join(', ')}. Colors: ${THEME_COLORS.join(', ')}.`,
    )
  }

  if (mode !== undefined && !isThemeMode(mode)) {
    return toToolError(
      'INVALID_INPUT',
      `Unknown mode "${mode}".`,
      `Use one of: ${THEME_MODES.join(', ')}.`,
    )
  }

  if (color !== undefined && !isThemeColor(color)) {
    return toToolError(
      'INVALID_INPUT',
      `Unknown color "${color}".`,
      `Use one of: ${THEME_COLORS.join(', ')}.`,
    )
  }

  if (mode !== undefined) {
    deps.setThemeMode(mode)
  }

  if (color !== undefined) {
    deps.setThemeColor(color)
  }

  return formatThemeResult(mode, color)
}

function handleToggleSound(deps: WebMcpToolDeps): WebMcpToolResult {
  const next = deps.toggleSoundPreference()

  return `Sounds are now ${next}.`
}

function isOneOf<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return value !== undefined && (values as readonly string[]).includes(value)
}

function toToolError(code: string, error: string, suggestion: string): WebMcpToolError {
  return {
    code,
    error,
    retryable: true,
    suggestion,
  }
}
