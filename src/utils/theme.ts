import type { ThemeColor } from '@/components/ThemeColor/types'
import type { EffectiveMode } from '@/components/ThemeMode/types'

import { DEFAULT_THEME_COLOR } from '@/components/ThemeColor/constants'
import { DEFAULT_THEME_MODE } from '@/components/ThemeMode/constants'

const CHROME_TOP_VAR = '--color-chrome-top'
const THEME_COLOR_META_NAME = 'theme-color'

function getHtmlElement(): HTMLElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  return document.documentElement
}

/**
 * Normalize a CSS color to #rrggbb for `<meta name="theme-color">`.
 * Hex passes through; rgb() is parsed; oklch and similar use a canvas.
 */
export function cssColorToHex(color: string): string | null {
  const value = color.trim()

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase()
  }

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const [, r, g, b] = value.toLowerCase()

    return `#${r}${r}${g}${g}${b}${b}`
  }

  const rgb = value.match(/^rgba?\(\s*([\d.]+)(?:\s*,\s*|\s+)([\d.]+)(?:\s*,\s*|\s+)([\d.]+)/i)

  if (rgb) {
    const hex = [rgb[1], rgb[2], rgb[3]]
      .map((channel) => {
        return Math.round(Number(channel)).toString(16).padStart(2, '0')
      })
      .join('')

    return `#${hex}`
  }

  return canvasColorToHex(value)
}

function canvasColorToHex(color: string): string | null {
  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function' ||
    !/^(?:oklch|oklab|lab|lch|hwb|color)\(/i.test(color)
  ) {
    return null
  }

  const canvas = document.createElement('canvas')

  if (typeof canvas.getContext !== 'function') {
    return null
  }

  canvas.height = 1
  canvas.width = 1
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data

  if (a === 0 || r === undefined || g === undefined || b === undefined) {
    return null
  }

  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function resolveChromeTopColor(): string | null {
  const html = getHtmlElement()

  if (
    !html ||
    typeof document.createElement !== 'function' ||
    typeof getComputedStyle !== 'function'
  ) {
    return null
  }

  const token = getComputedStyle(html).getPropertyValue(CHROME_TOP_VAR).trim()

  if (!token) {
    return null
  }

  const probe = document.createElement('span')
  probe.style.color = `var(${CHROME_TOP_VAR})`
  html.appendChild(probe)

  const resolved = getComputedStyle(probe).color
  probe.remove()

  return cssColorToHex(resolved) ?? cssColorToHex(token)
}

/** Write `--color-chrome-top` to `<meta name="theme-color">` for Safari. */
export function syncBrowserThemeColor(): void {
  if (typeof document === 'undefined' || !document.head) {
    return
  }

  const color = resolveChromeTopColor()

  if (!color) {
    return
  }

  const existing = document.querySelector<HTMLMetaElement>(`meta[name="${THEME_COLOR_META_NAME}"]`)

  if (existing?.content.toLowerCase() === color.toLowerCase()) {
    return
  }

  // Safari often ignores in-place content updates, so replace the tag.
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
  syncBrowserThemeColor()
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
