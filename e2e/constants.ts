import { toHrefTestId, toNavMenuId } from '../src/features/navigation/navigation.utils'

export const TEST_ID = {
  commandPalette: 'command-palette',
  commandPaletteInput: 'command-palette-input',
  commandPaletteTrigger: 'command-palette-trigger',
  desktopNav: 'desktop-nav',
  main: 'main',
  mobileAppearance: 'mobile-appearance',
  mobileMenu: 'mobile-menu',
  mobileMenuTrigger: 'mobile-menu-trigger',
  siteHeader: 'site-header',
  siteHomeLink: 'site-home-link',
  siteNav: 'site-nav',
  skipLink: 'skip-link',
  themeToggle: 'theme-toggle',
} as const

export const THEME_MODE_STORAGE_KEY = 'theme-mode'
export const THEME_SEED_LOCK_KEY = '__e2e-theme-seeded'

export const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const

export function greetingLinkTestId(href: string): string {
  return toHrefTestId('greeting-link', href)
}

export function navLinkTestId(href: string): string {
  return toHrefTestId('nav-link', href)
}

export function navMenuTestId(name: string): string {
  return toNavMenuId(name)
}

export function themeOptionTestId(mode: string): string {
  return `theme-option-${mode}`
}
