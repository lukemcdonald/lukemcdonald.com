import type { FontPairing } from '@/components/Settings/Font/font'
import type { SoundPreference } from '@/components/Settings/Sound/types'
import type { ThemeColor } from '@/components/Settings/ThemeColor/types'
import type { ThemeMode } from '@/components/Settings/ThemeMode/types'

import { FONT_PAIRING_CONFIGS, FONT_PAIRINGS } from '@/components/Settings/Font/pairings'
import { THEME_COLORS, THEME_LABELS } from '@/components/Settings/ThemeColor/constants'
import { isThemeColor } from '@/components/Settings/ThemeColor/utils'
import { MODE_LABELS, THEME_MODES } from '@/components/Settings/ThemeMode/constants'
import { isThemeMode } from '@/components/Settings/ThemeMode/utils'

import {
  toFontPairingChoices,
  toPageChoices,
  toSecretNameProperty,
  toStringChoiceProperty,
  toStringEnumProperty,
  type WebMcpPage,
  type WebMcpSecret,
} from './webmcp.utils'

export type { WebMcpPage, WebMcpSecret }

const EMPTY_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {},
  type: 'object',
} as const

const WEBMCP_OUTPUT_MAX = 1500

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
  setSoundPreference: (enabled: boolean) => SoundPreference
  setThemeColor: (color: ThemeColor) => void
  setThemeMode: (mode: ThemeMode) => void
}

export type WebMcpToolError = {
  code: string
  error: string
  retryable: boolean
  suggestion?: string
}

export type WebMcpToolResult = string | WebMcpToolError

export function createWebMcpTools(deps: WebMcpToolDeps) {
  const fontPairing = toStringChoiceProperty(
    'Font pairing to apply.',
    toFontPairingChoices(FONT_PAIRING_CONFIGS),
  )
  const pages = toStringChoiceProperty('Path of the page to open.', toPageChoices(deps.pages))
  const secrets = toSecretNameProperty(
    'Secret to show and mark as found.',
    deps.getEasterEggCatalog(),
  )

  return [
    {
      description:
        'Sets the site appearance and color. Use when the visitor wants a different look or theme color.',
      execute: (input: { color?: string; mode?: string }) => {
        return handleSetTheme(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          color: toStringEnumProperty("One of the site's theme colors.", THEME_COLORS),
          mode: toStringEnumProperty('Site appearance.', THEME_MODES),
        },
        type: 'object',
      },
      name: 'set_theme',
    },
    {
      description: "Applies a font pairing. Use when the visitor wants to change the site's fonts.",
      execute: (input: { pairing?: string }) => {
        return handleSetFontPairing(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          pairing: fontPairing,
        },
        required: ['pairing'],
        type: 'object',
      },
      name: 'set_font_pairing',
    },
    {
      description:
        'Turns interaction sounds on or off. Use when the visitor wants to mute or unmute UI sounds.',
      execute: (input: { enabled?: unknown }) => {
        return handleSetSound(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          enabled: {
            description: 'Whether interaction sounds should play.',
            type: 'boolean',
          },
        },
        required: ['enabled'],
        type: 'object',
      },
      name: 'set_sound',
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
          page: pages,
        },
        required: ['page'],
        type: 'object',
      },
      name: 'navigate_to_page',
    },
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        'Lists hidden secrets with a hint and whether each has been found. Use when the visitor asks what secrets exist or which are still undiscovered.',
      execute: () => {
        return handleListSecrets(deps)
      },
      inputSchema: EMPTY_INPUT_SCHEMA,
      name: 'list_secrets',
    },
    {
      description:
        "Shows a named secret's effect and marks it as found. Use when the visitor wants to find a specific secret.",
      execute: (input: { name?: string }) => {
        return handleFindSecret(deps, input)
      },
      inputSchema: {
        additionalProperties: false,
        properties: {
          name: secrets,
        },
        required: ['name'],
        type: 'object',
      },
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

function getSecretIds(deps: WebMcpToolDeps) {
  return deps.getEasterEggCatalog().map((secret) => {
    return secret.id
  })
}

async function handleFindSecret(
  deps: WebMcpToolDeps,
  input: { name?: string },
): Promise<WebMcpToolResult> {
  const name = input.name
  const secretIds = getSecretIds(deps)

  if (!isOneOf(secretIds, name)) {
    return toToolError(
      'UNKNOWN_SECRET',
      name ? `Unknown secret "${name}".` : 'Provide a secret name.',
      `Use one of: ${secretIds.join(', ')}.`,
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

  const config = FONT_PAIRING_CONFIGS.find((item) => {
    return item.id === pairing
  })

  deps.setFontPairing(pairing)

  return `Font pairing is now ${config?.label ?? pairing}.`
}

function handleSetSound(deps: WebMcpToolDeps, input: { enabled?: unknown }): WebMcpToolResult {
  const enabled = input.enabled

  if (typeof enabled !== 'boolean') {
    return toToolError(
      'INVALID_INPUT',
      enabled === undefined ?
        'Provide enabled as true or false.'
      : 'enabled must be true or false.',
      'Pass enabled: true to turn sounds on, or enabled: false to turn them off.',
    )
  }

  const next = deps.setSoundPreference(enabled)

  return `Sounds are now ${next}.`
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
