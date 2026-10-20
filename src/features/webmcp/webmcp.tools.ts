import type { FontPairing } from '@/components/Settings/Font/font'
import type { SoundPreference } from '@/components/Settings/Sound/types'
import type { ThemeColor } from '@/components/Settings/ThemeColor/types'
import type { ThemeMode } from '@/components/Settings/ThemeMode/types'

import { FONT_PAIRINGS } from '@/components/Settings/Font/pairings'
import { THEME_LABELS } from '@/components/Settings/ThemeColor/constants'
import { isThemeColor } from '@/components/Settings/ThemeColor/utils'
import { MODE_LABELS } from '@/components/Settings/ThemeMode/constants'
import { isThemeMode } from '@/components/Settings/ThemeMode/utils'

import {
  FONT_PAIRING_VALUES,
  type FontPairingValue,
  SECRET_IDS,
  type SecretId,
  SITE_PAGE_PATHS,
  SITE_PAGE_TITLES,
  type SitePagePath,
  THEME_COLOR_VALUES,
  THEME_MODE_VALUES,
  WEBMCP_OUTPUT_MAX,
} from './webmcp.constants'

export type WebMcpSecret = {
  hint: string
  id: string
  name: string
}

export type WebMcpToolDeps = {
  findEasterEgg: (
    id: string,
  ) => Promise<{ alreadyActive: boolean; id: string; name: string } | undefined>
  getEasterEggCatalog: () => readonly WebMcpSecret[]
  getFontPairing: () => FontPairing
  getFoundEasterEggIds: () => readonly string[]
  getSoundPreference: () => SoundPreference
  getThemeColor: () => ThemeColor
  getThemeMode: () => ThemeMode
  navigate: (href: string) => void | Promise<void>
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

export const SET_THEME_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {
    color: {
      description: "One of the site's theme colors.",
      enum: THEME_COLOR_VALUES,
      type: 'string',
    },
    mode: {
      description: 'Light, dark, or match the system appearance.',
      enum: THEME_MODE_VALUES,
      type: 'string',
    },
  },
  type: 'object',
} as const

export const SET_FONT_PAIRING_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {
    pairing: {
      description: 'Work, play, or live font pairing.',
      enum: FONT_PAIRING_VALUES,
      type: 'string',
    },
  },
  required: ['pairing'],
  type: 'object',
} as const

export const EMPTY_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {},
  type: 'object',
} as const

export const NAVIGATE_TO_PAGE_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {
    page: {
      description: 'Path of the page to open.',
      enum: SITE_PAGE_PATHS,
      type: 'string',
    },
  },
  required: ['page'],
  type: 'object',
} as const

export const FIND_SECRET_INPUT_SCHEMA = {
  additionalProperties: false,
  properties: {
    name: {
      description: 'Name of the secret to unlock.',
      enum: SECRET_IDS,
      type: 'string',
    },
  },
  required: ['name'],
  type: 'object',
} as const

export function handleSetTheme(
  deps: WebMcpToolDeps,
  input: { color?: string; mode?: string },
): WebMcpToolResult {
  const color = input.color
  const mode = input.mode

  if (color === undefined && mode === undefined) {
    return toToolError(
      'INVALID_INPUT',
      'Provide a mode, a color, or both.',
      `Modes: ${THEME_MODE_VALUES.join(', ')}. Colors: ${THEME_COLOR_VALUES.join(', ')}.`,
    )
  }

  if (mode !== undefined && !isThemeMode(mode)) {
    return toToolError(
      'INVALID_INPUT',
      `Unknown mode "${mode}".`,
      `Use one of: ${THEME_MODE_VALUES.join(', ')}.`,
    )
  }

  if (color !== undefined && !isThemeColor(color)) {
    return toToolError(
      'INVALID_INPUT',
      `Unknown color "${color}".`,
      `Use one of: ${THEME_COLOR_VALUES.join(', ')}.`,
    )
  }

  if (mode !== undefined) {
    deps.setThemeMode(mode)
  }

  if (color !== undefined) {
    deps.setThemeColor(color)
  }

  return formatThemeResult(deps.getThemeMode(), deps.getThemeColor(), Boolean(mode), Boolean(color))
}

export function handleSetFontPairing(
  deps: WebMcpToolDeps,
  input: { pairing?: string },
): WebMcpToolResult {
  const pairing = input.pairing

  if (!isFontPairingValue(pairing)) {
    return toToolError(
      'INVALID_INPUT',
      pairing ? `Unknown font pairing "${pairing}".` : 'Provide a font pairing.',
      `Use one of: ${FONT_PAIRING_VALUES.join(', ')}.`,
    )
  }

  deps.setFontPairing(pairing)

  return `Font pairing is now ${pairing}.`
}

export function handleToggleSound(deps: WebMcpToolDeps): WebMcpToolResult {
  const next = deps.toggleSoundPreference()

  return `Sounds are now ${next}.`
}

export async function handleNavigateToPage(
  deps: WebMcpToolDeps,
  input: { page?: string },
): Promise<WebMcpToolResult> {
  const page = input.page

  if (!isSitePagePath(page)) {
    return toToolError(
      'UNKNOWN_PAGE',
      page ? `Unknown page "${page}".` : 'Provide a page path.',
      `Use one of: ${SITE_PAGE_PATHS.join(', ')}.`,
    )
  }

  await deps.navigate(page)

  return `Opened ${SITE_PAGE_TITLES[page]} (${page}).`
}

export function handleListSecrets(deps: WebMcpToolDeps): WebMcpToolResult {
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

export async function handleFindSecret(
  deps: WebMcpToolDeps,
  input: { name?: string },
): Promise<WebMcpToolResult> {
  const name = input.name

  if (!isSecretId(name)) {
    return toToolError(
      'UNKNOWN_SECRET',
      name ? `Unknown secret "${name}".` : 'Provide a secret name.',
      `Use one of: ${SECRET_IDS.join(', ')}.`,
    )
  }

  const result = await deps.findEasterEgg(name)

  if (!result) {
    return toToolError(
      'UNKNOWN_SECRET',
      `Unknown secret "${name}".`,
      `Use one of: ${SECRET_IDS.join(', ')}.`,
    )
  }

  if (result.alreadyActive) {
    return `${result.name} is already in play.`
  }

  return `Found ${result.name}. Its effect is in play.`
}

function clipToolOutput(payload: string) {
  if (payload.length <= WEBMCP_OUTPUT_MAX) {
    return payload
  }

  return `${payload.slice(0, WEBMCP_OUTPUT_MAX - 1)}...`
}

function formatThemeResult(
  mode: ThemeMode,
  color: ThemeColor,
  changedMode: boolean,
  changedColor: boolean,
) {
  const parts: string[] = []

  if (changedMode) {
    parts.push(`Appearance is now ${MODE_LABELS[mode].toLowerCase()}.`)
  }

  if (changedColor) {
    parts.push(`Color is now ${THEME_LABELS[color].toLowerCase()}.`)
  }

  return parts.join(' ')
}

function isFontPairingValue(value: string | undefined): value is FontPairingValue {
  return value !== undefined && (FONT_PAIRINGS as readonly string[]).includes(value)
}

function isSecretId(value: string | undefined): value is SecretId {
  return value !== undefined && (SECRET_IDS as readonly string[]).includes(value)
}

function isSitePagePath(value: string | undefined): value is SitePagePath {
  return value !== undefined && (SITE_PAGE_PATHS as readonly string[]).includes(value)
}

function toToolError(code: string, error: string, suggestion: string): WebMcpToolError {
  return {
    code,
    error,
    retryable: true,
    suggestion,
  }
}
