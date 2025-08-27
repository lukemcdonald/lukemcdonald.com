export type SeoContentType = 'article' | 'blog' | 'page'

export interface SeoMeta {
  /**
   * Absolute canonical URL (e.g., https://example.com/path)
   */
  author?: {
    name: string
    url?: string
  }
  canonicalUrl?: string | URL
  contentType?: SeoContentType
  description?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  lang?: string
  modDatetime?: Date | null
  ogImage?: string
  pubDatetime?: Date | null
  title: string
}
