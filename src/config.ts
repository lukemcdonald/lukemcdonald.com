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
  blog: 'src/content/blog',
} as const

// Theme configuration - users can customize these settings
export const THEME_CONFIG = {
  // Display settings
  display: {
    // Show publication dates on pages
    showDates: true,

    // Show "last updated" on pages
    showLastUpdated: true,

    // Show draft indicator in development
    showDraftIndicator: true,

    // Default sort order for identity pages
    defaultSort: 'title' as 'title' | 'date' | 'custom',
  },

  // Navigation settings
  navigation: {
    // Show numbered list for identity pages
    showNumbers: true,

    // Show subtitles in navigation
    showSubtitles: true,

    // Maximum items to show (0 = all)
    maxItems: 0,
  },

  // SEO settings
  seo: {
    // Generate sitemap
    generateSitemap: true,

    // Generate RSS feed
    generateRSS: false,

    // Default meta description
    defaultDescription: 'Personal website and portfolio',
  },

  // Theme appearance
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
