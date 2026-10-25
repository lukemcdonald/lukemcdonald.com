import type { ImageMetadata } from 'astro'

export type SeoContentType = 'article' | 'blog' | 'page'

export interface SeoMeta {
  author?: {
    name: string
    url?: string
  }
  canonicalUrl?: string | URL
  contentType?: SeoContentType
  description?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  heading?: string
  lang?: string
  modDate?: Date
  ogImage?: string
  photo?: ImageMetadata
  pubDate?: Date
  robots?: string
  title: string
}
