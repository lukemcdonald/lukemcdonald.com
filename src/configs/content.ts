export const CONTENT_CONFIG = {
  collections: {
    pages: {
      id: 'pages',
      path: 'src/content/pages',
    },
    resume: {
      id: 'resume',
      path: 'src/content/resume',
    },
  },
  settings: {
    defaultLocale: 'en',
    enableDrafts: false,
  },
} as const

export type ContentConfig = typeof CONTENT_CONFIG
