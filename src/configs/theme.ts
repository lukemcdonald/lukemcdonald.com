export const THEME_CONFIG = {
  // TODO: Theme appearance
  appearance: {
    // Enable dark mode
    enableDarkMode: true,
    // Show theme switcher
    showThemeSwitcher: true,
    // Default theme color
    themeColor: '#122023',
  },

  // TODO: SEO settings
  seo: {
    // Default meta description
    defaultDescription: 'Personal website and portfolio',
    // Generate sitemap
    generateSitemap: true,
  },
} as const

export type ThemeConfig = typeof THEME_CONFIG
