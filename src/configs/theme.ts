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

export type ThemeConfig = typeof THEME_CONFIG
