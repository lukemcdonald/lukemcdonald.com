import {
  toHrefTestId,
  toNavMenuId,
  toPaletteNavGroupId,
} from '../src/features/navigation/navigation.utils'

export const TEST_ID = {
  commandPalette: 'command-palette',
  commandPaletteDialog: 'command-palette-dialog',
  commandPaletteInput: 'command-palette-input',
  commandPaletteSecrets: 'command-palette-secrets',
  commandPaletteTrigger: 'command-palette-trigger',
  desktopNav: 'desktop-nav',
  easterEgg: 'easter-egg',
  fcaEggClose: 'fca-egg-close',
  fcaEggDialog: 'fca-egg-dialog',
  fcaEggIframe: 'fca-egg-iframe',
  fontToggle: 'font-toggle',
  main: 'main',
  mobileAppearance: 'mobile-appearance',
  mobileFont: 'mobile-font',
  mobileMenu: 'mobile-menu',
  mobileMenuTrigger: 'mobile-menu-trigger',
  pageTitle: 'page-title',
  resumeMcpCopy: 'resume-mcp-copy',
  resumeMcpCopyStatus: 'resume-mcp-copy-status',
  resumeMcpDismiss: 'resume-mcp-dismiss',
  resumeMcpToggle: 'resume-mcp-toggle',
  resumeMcpUrl: 'resume-mcp-url',
  resumeMcpWidget: 'resume-mcp-widget',
  siteHeader: 'site-header',
  siteHomeLink: 'site-home-link',
  siteNav: 'site-nav',
  skipLink: 'skip-link',
  themeToggle: 'theme-toggle',
  verse: 'verse',
  verseSkeleton: 'verse-skeleton',
} as const

export const THEME_SEED_LOCK_KEY = '__e2e-theme-seeded'

export const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const

export function commandPaletteEggTestId(id: string): string {
  return `command-palette-egg-${id}`
}

export function commandPaletteNavGroupTestId(name: string): string {
  return toPaletteNavGroupId(name)
}

export function commandPalettePageTestId(href: string): string {
  return toHrefTestId('command-palette-page', href)
}

export function fontOptionTestId(pairing: string): string {
  return `font-option-${pairing}`
}

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
