import type { MenuLinkItem } from '@/features/navigation/navigation.types'
import type { WebMCP } from 'webmcp-types'

import {
  findEasterEgg,
  getEasterEggCatalog,
  getFoundEasterEggIds,
} from '@/components/EasterEggs/easter-eggs'
import { getFontPairing, setFontPairing } from '@/components/Settings/Font/font'
import { getSoundPreference, setSoundPreference } from '@/components/Settings/Sound/utils'
import { getThemeColor, setThemeColor } from '@/components/Settings/ThemeColor/utils'
import { getThemeMode, setThemeMode } from '@/components/Settings/ThemeMode/utils'

import { createWebMcpTools, type WebMcpToolDeps } from './webmcp.tools'

let registration: AbortController | undefined

export function createWebMcpDeps(
  overrides: Partial<WebMcpToolDeps> & Pick<WebMcpToolDeps, 'navigate' | 'pages'>,
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
    setSoundPreference,
    setThemeColor,
    setThemeMode,
    ...overrides,
  }
}

export function readWebMcpPages(): MenuLinkItem[] {
  const node = document.querySelector('[data-webmcp-pages]')
  const raw = node?.textContent?.trim()

  if (!raw) {
    return []
  }

  return JSON.parse(raw) as MenuLinkItem[]
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

  for (const tool of createWebMcpTools(deps)) {
    await modelContext.registerTool(tool, { signal })
  }
}

function getModelContext(): WebMCP.ModelContext | undefined {
  if (typeof document === 'undefined' || !('modelContext' in document)) {
    return
  }

  const { modelContext } = document

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return
  }

  return modelContext
}
