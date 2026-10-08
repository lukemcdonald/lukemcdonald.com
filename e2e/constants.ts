export const TEST_ID = {
  commandPalette: 'command-palette',
  commandPaletteInput: 'command-palette-input',
  commandPaletteTrigger: 'command-palette-trigger',
  main: 'main',
  mobileAppearance: 'mobile-appearance',
  mobileMenuTrigger: 'mobile-menu-trigger',
  siteHeader: 'site-header',
  siteHomeLink: 'site-home-link',
  siteNav: 'site-nav',
  skipLink: 'skip-link',
  themeToggle: 'theme-toggle',
} as const

export const THEME_MODE_STORAGE_KEY = 'theme-mode'

export const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const

export function greetingLinkTestId(href: string): string {
  return `greeting-link-${hrefSlug(href)}`
}

export function hrefSlug(href: string): string {
  return href.replace(/^\//, '').replaceAll('/', '-') || 'home'
}

export function navLinkTestId(href: string): string {
  return `nav-link-${hrefSlug(href)}`
}

export function navMenuTestId(name: string): string {
  return `nav-menu-${name.trim().toLowerCase()}`
}

export function themeOptionTestId(mode: string): string {
  return `theme-option-${mode}`
}
