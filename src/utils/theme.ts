import type { ThemeColor } from '@/components/ThemeColor/types'
import type { EffectiveMode } from '@/components/ThemeMode/types'

import { DEFAULT_THEME_COLOR } from '@/components/ThemeColor/constants'
import { DEFAULT_THEME_MODE } from '@/components/ThemeMode/constants'

const BROWSER_THEME_COLOR_VAR = '--color-primary-500'
const THEME_COLOR_META_NAME = 'theme-color'

function getHtmlElement(): HTMLElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  return document.documentElement
}

/**
 * Normalize a computed CSS color to #rrggbb for `<meta name="theme-color">`.
 * Safari is most reliable with hex; getComputedStyle typically returns rgb().
 */
export function cssColorToHex(color: string): string | null {
  const value = color.trim()

  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
    if (value.length === 4 || value.length === 5) {
      const [, r, g, b] = value

      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }

    return value.slice(0, 7).toLowerCase()
  }

  const commaMatch = value.match(/^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)/i)
  const spaceMatch = value.match(/^rgba?\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)/i)
  const match = commaMatch ?? spaceMatch

  if (!match) {
    return null
  }

  const channels = [match[1], match[2], match[3]].map((channel) => {
    if (!channel) {
      return '00'
    }

    const isPercent = channel.endsWith('%')
    const n = Number.parseFloat(channel)
    const byte = isPercent ? (n / 100) * 255 : n
    const clamped = Math.min(255, Math.max(0, Math.round(byte)))

    return clamped.toString(16).padStart(2, '0')
  })

  return `#${channels.join('')}`
}

function resolveBrowserThemeColor(): string | null {
  const html = getHtmlElement()

  if (
    !html ||
    typeof document.createElement !== 'function' ||
    typeof getComputedStyle !== 'function'
  ) {
    return null
  }

  const token = getComputedStyle(html).getPropertyValue(BROWSER_THEME_COLOR_VAR).trim()

  if (!token) {
    return null
  }

  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = `color:var(${BROWSER_THEME_COLOR_VAR});height:0;overflow:hidden;pointer-events:none;position:absolute;width:0`
  html.appendChild(probe)

  const resolved = getComputedStyle(probe).color

  if (typeof probe.remove === 'function') {
    probe.remove()
  }

  if (!resolved || resolved === 'rgba(0, 0, 0, 0)' || resolved === 'transparent') {
    return null
  }

  return cssColorToHex(resolved) ?? resolved
}

/**
 * Keep Safari/Chrome UI chrome in sync with the entry header (`bg-primary-500`).
 * iOS Safari often ignores in-place `content` updates, so the tag is replaced.
 */
export function syncBrowserThemeColor(): void {
  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function' ||
    !document.head
  ) {
    return
  }

  const color = resolveBrowserThemeColor()

  if (!color) {
    return
  }

  const existing = document.querySelector<HTMLMetaElement>(`meta[name="${THEME_COLOR_META_NAME}"]`)

  if (existing?.content.toLowerCase() === color.toLowerCase()) {
    return
  }

  existing?.remove()

  const meta = document.createElement('meta')
  meta.content = color
  meta.name = THEME_COLOR_META_NAME
  document.head.appendChild(meta)
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

  syncBrowserThemeColor()
}

export function applyThemeMode(mode: EffectiveMode): void {
  const html = getHtmlElement()

  if (!html) {
    return
  }

  html.classList.toggle('dark', mode === 'dark')
}

/**
 * Get inline script for initializing theme before hydration (prevents flash)
 */
export function getThemeInitScript(): string {
  return `
(function() {
  try {
    const STORAGE_KEYS = { color: 'theme-color', mode: 'theme-mode' };
    const DEFAULT_THEME_COLOR = '${DEFAULT_THEME_COLOR}';
    const DEFAULT_THEME_MODE = '${DEFAULT_THEME_MODE}';

    const getSystemPreference = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const storedColor = localStorage.getItem(STORAGE_KEYS.color) || DEFAULT_THEME_COLOR;
    const storedMode = localStorage.getItem(STORAGE_KEYS.mode) || DEFAULT_THEME_MODE;
    const effectiveMode = storedMode === 'system' ? getSystemPreference() : storedMode;

    const html = document.documentElement;

    if (storedColor !== 'default') {
      html.setAttribute('data-theme', storedColor);
    } else {
      html.removeAttribute('data-theme');
    }

    if (effectiveMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  } catch (e) {
    console.error('Failed to initialize theme:', e);
  }
})();
`.trim()
}
