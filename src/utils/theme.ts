import type { ThemeColor } from '@/components/Settings/ThemeColor/types'
import type { EffectiveMode } from '@/components/Settings/ThemeMode/types'

function getHtmlElement(): HTMLElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  return document.documentElement
}

export function applyThemeColor(color: ThemeColor): void {
  const html = getHtmlElement()

  if (!html) {
    return
  }

  if (color === 'default') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', color)
  }
}

export function applyThemeMode(mode: EffectiveMode): void {
  const html = getHtmlElement()

  if (!html) {
    return
  }

  html.classList.toggle('dark', mode === 'dark')
}
