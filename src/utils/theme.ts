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
 * Normalize a CSS color to #rrggbb. Hex passes through; rgb() from
 * getComputedStyle is converted. oklch and other spaces need the browser to
 * resolve them first (see getBrowserThemeColor).
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
    return null
  }

  const hex = [rgb[1], rgb[2], rgb[3]]
    .map((channel) => {
      return Math.round(Number(channel)).toString(16).padStart(2, '0')
    })
    .join('')

  return `#${hex}`
}

function readPrimaryColor(): string | null {
  if (
    typeof document === 'undefined' ||
    typeof document.createElement !== 'function' ||
    typeof getComputedStyle !== 'function'
  ) {
    return null
  }

  const html = document.documentElement
  const token = getComputedStyle(html).getPropertyValue(BROWSER_THEME_COLOR_VAR).trim()

  if (!token) {
    return null
  }

  const probe = document.createElement('span')
  probe.style.color = `var(${BROWSER_THEME_COLOR_VAR})`
  html.appendChild(probe)

  const resolved = getComputedStyle(probe).color
  probe.remove()

  if (!resolved || resolved === 'rgba(0, 0, 0, 0)' || resolved === 'transparent') {
    return null
  }

  return resolved
}

/**
 * Resolve the browser chrome color from `--color-primary-500`, falling back
 * to `fallback` (typically GLOBAL_CONFIG.themeColor). Meta tags cannot use
 * CSS variables, so this returns a hex string.
 */
export function getBrowserThemeColor(fallback: string): string {
  return cssColorToHex(readPrimaryColor() ?? fallback) ?? fallback
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
