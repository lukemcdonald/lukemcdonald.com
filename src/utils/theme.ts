import type { ThemeColor } from '@/components/ThemeColor/types'
import type { EffectiveMode } from '@/components/ThemeMode/types'

import { DEFAULT_THEME_COLOR } from '@/components/ThemeColor/constants'
import { DEFAULT_THEME_MODE } from '@/components/ThemeMode/constants'

function getHtmlElement(): HTMLElement | null {
  if (typeof window === 'undefined') {
    return null
  }

  return document.documentElement
}

function refreshSafariChromeSample() {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') {
    return
  }

  const samplers = document.querySelectorAll<HTMLElement>('[data-safari-chrome]')

  if (samplers.length === 0) {
    return
  }

  samplers.forEach((sampler) => {
    sampler.style.display = 'none'
  })

  samplers.forEach((sampler) => {
    sampler.offsetHeight
  })

  const showSamplers = () => {
    samplers.forEach((sampler) => {
      sampler.style.display = ''
    })
  }

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(showSamplers)

    return
  }

  showSamplers()
}

export function applyThemeColor(color: ThemeColor): void {
  const html = getHtmlElement()

  if (!html) {
    return
  }

  const currentTheme = html.getAttribute?.('data-theme') ?? null
  const nextTheme = color === 'default' ? null : color

  if (currentTheme === nextTheme) {
    return
  }

  if (nextTheme === null) {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', nextTheme)
  }

  refreshSafariChromeSample()
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
