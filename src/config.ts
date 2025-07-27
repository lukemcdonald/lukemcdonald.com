const domain = 'lukemcdonald.com'
const url = `https://${domain}`
const name = 'Luke McDonald'

export const SITE = {
  author: {
    name,
    url,
  },
  name,
  domain,
  url,
  dir: 'ltr',
  themeColor: '#122023',
  lang: 'en',
  timezone: 'America/Chicago',
} as const

// Content collection paths - single source of truth
export const CONTENT_PATHS = {
  main: 'src/content/index',
  identity: 'src/content/i-am-a',
} as const

// Theme configuration - users can customize these settings
export const THEME_CONFIG = {
  // TODO: SEO settings
  seo: {
    // Generate sitemap
    generateSitemap: true,
    // Default meta description
    defaultDescription: 'Personal website and portfolio',
  },

  // TODO: Theme appearance
  appearance: {
    // Default theme color
    themeColor: '#122023',
    // Enable dark mode
    enableDarkMode: true,
    // Show theme switcher
    showThemeSwitcher: true,
  },
} as const

// Type for theme configuration
export type ThemeConfig = typeof THEME_CONFIG
