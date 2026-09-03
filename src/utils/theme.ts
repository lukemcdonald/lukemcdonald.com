import type { ThemeColor } from '@/components/ThemeColor/types'
import type { EffectiveMode } from '@/components/ThemeMode/types'

import { DEFAULT_THEME_COLOR } from '@/components/ThemeColor/constants'
import { DEFAULT_THEME_MODE } from '@/components/ThemeMode/constants'

const CHROME_COLOR_VAR = '--chrome-color'
const THEME_COLOR_META_NAME = 'theme-color'

function getHtmlElement(): HTMLElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  return document.documentElement
}

/**
 * Normalize a CSS color to #rrggbb. Hex passes through; rgb() from
 * getComputedStyle is converted. oklch and other spaces use a canvas.
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

  if (!rgb) {
    return canvasColorToHex(value)
  }

  const hex = [rgb[1], rgb[2], rgb[3]]
    .map((channel) => {
      return Math.round(Number(channel)).toString(16).padStart(2, '0')
    })
    .join('')

  return `#${hex}`
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

function readChromeColor(): string | null {
  const html = getHtmlElement()

  if (!html || typeof getComputedStyle !== 'function') {
    return null
  }

  const value = getComputedStyle(html).getPropertyValue(CHROME_COLOR_VAR).trim()

  if (!value) {
    return null
  }

  return value
}

/**
 * Resolve the browser chrome color from `--chrome-color`, falling back
 * to `fallback` (typically GLOBAL_CONFIG.themeColor). Meta tags cannot use
 * CSS variables, so this returns a hex string.
 */
export function getBrowserThemeColor(fallback: string): string {
  return cssColorToHex(readChromeColor() ?? fallback) ?? fallback
}

export function syncBrowserThemeColor(): void {
  if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
    return
  }

  const meta = document.querySelector<HTMLMetaElement>(`meta[name="${THEME_COLOR_META_NAME}"]`)

  if (!meta) {
    return
  }

  meta.content = getBrowserThemeColor(meta.content)
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
