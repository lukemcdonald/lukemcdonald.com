import {
  findEasterEgg,
  getEasterEggCatalog,
  getFoundEasterEggIds,
} from '@/components/EasterEggs/easter-eggs'
import { getFontPairing, setFontPairing } from '@/components/Settings/Font/font'
import { getSoundPreference, toggleSoundPreference } from '@/components/Settings/Sound/utils'
import { getThemeColor, setThemeColor } from '@/components/Settings/ThemeColor/utils'
import { getThemeMode, setThemeMode } from '@/components/Settings/ThemeMode/utils'

import {
  EMPTY_INPUT_SCHEMA,
  FIND_SECRET_INPUT_SCHEMA,
  handleFindSecret,
  handleListSecrets,
  handleNavigateToPage,
  handleSetFontPairing,
  handleSetTheme,
  handleToggleSound,
  NAVIGATE_TO_PAGE_INPUT_SCHEMA,
  SET_FONT_PAIRING_INPUT_SCHEMA,
  SET_THEME_INPUT_SCHEMA,
  type WebMcpToolDeps,
} from './webmcp.tools'

let registration: AbortController | undefined

export function createWebMcpDeps(
  overrides: Partial<WebMcpToolDeps> & Pick<WebMcpToolDeps, 'navigate'>,
): WebMcpToolDeps {
  return {
    findEasterEgg,
    getEasterEggCatalog,
    getFontPairing,
    getFoundEasterEggIds,
    getSoundPreference,
    getThemeColor,
    getThemeMode,
    setFontPairing,
    setThemeColor,
    setThemeMode,
    toggleSoundPreference,
    ...overrides,
  }
}

export function resetWebMcpRegistration() {
  registration?.abort()
  registration = undefined
}

export async function registerWebMcpTools(deps: WebMcpToolDeps) {
  const modelContext = getModelContext()

  if (!modelContext) {
    return
  }

  if (registration) {
    return
  }

  const controller = new AbortController()

  registration = controller

  const { signal } = controller

  await modelContext.registerTool(
    {
      description:
        'Sets the site appearance and color. Use when the visitor wants a light, dark, or system look, or a different theme color.',
      execute: (input) => handleSetTheme(deps, input),
      inputSchema: SET_THEME_INPUT_SCHEMA,
      name: 'set_theme',
    },
    { signal },
  )
  await modelContext.registerTool(
    {
      description:
        "Applies a work, play, or live font pairing. Use when the visitor wants to change the site's fonts.",
      execute: (input) => handleSetFontPairing(deps, input),
      inputSchema: SET_FONT_PAIRING_INPUT_SCHEMA,
      name: 'set_font_pairing',
    },
    { signal },
  )
  await modelContext.registerTool(
    {
      description:
        'Turns interaction sounds on or off. Use when the visitor wants to mute or unmute UI sounds.',
      execute: () => handleToggleSound(deps),
      inputSchema: EMPTY_INPUT_SCHEMA,
      name: 'toggle_sound',
    },
    { signal },
  )
  await modelContext.registerTool(
    {
      description:
        "Opens one of the site's pages. Use when the visitor wants to go to a specific page.",
      execute: (input) => handleNavigateToPage(deps, input),
      inputSchema: NAVIGATE_TO_PAGE_INPUT_SCHEMA,
      name: 'navigate_to_page',
    },
    { signal },
  )
  await modelContext.registerTool(
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        'Lists hidden surprises with a hint and whether each has been found. Use when the visitor asks what secrets exist or which are still undiscovered.',
      execute: () => handleListSecrets(deps),
      inputSchema: EMPTY_INPUT_SCHEMA,
      name: 'list_secrets',
    },
    { signal },
  )
  await modelContext.registerTool(
    {
      description:
        'Unlocks a named hidden surprise and plays its effect. Use when the visitor wants to find a secret by name.',
      execute: (input) => handleFindSecret(deps, input),
      inputSchema: FIND_SECRET_INPUT_SCHEMA,
      name: 'find_secret',
    },
    { signal },
  )
}

function getModelContext() {
  if (typeof document === 'undefined' || !('modelContext' in document)) {
    return
  }

  const { modelContext } = document

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return
  }

  return modelContext
}
