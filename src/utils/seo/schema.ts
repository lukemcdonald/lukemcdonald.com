import type { SeoContentType, SeoMeta } from './types'

import { GLOBAL_CONFIG } from '@/configs/global'

type SchemaType = 'Article' | 'BlogPosting' | 'WebPage'

const CONTENT_TYPE_MAP: Record<SeoContentType, SchemaType> = {
  article: 'Article',
  blog: 'BlogPosting',
  page: 'WebPage',
} as const

function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    alternateName: new URL(GLOBAL_CONFIG.site.origin).hostname,
    name: GLOBAL_CONFIG.name,
    url: GLOBAL_CONFIG.site.origin,
  }
}

function buildPageJsonLd(meta: SeoMeta) {
  const { author, canonicalUrl, contentType = 'page', description, modDate, pubDate, title } = meta

  const type = CONTENT_TYPE_MAP[contentType]
  const isArticleOrBlog = type === 'Article' || type === 'BlogPosting'

  const publisher = {
    '@type': 'Organization',
    name: GLOBAL_CONFIG.name,
    url: GLOBAL_CONFIG.site.origin,
  }

  const website = {
    '@type': 'WebSite',
    name: GLOBAL_CONFIG.name,
    url: GLOBAL_CONFIG.site.origin,
  }

  const url = canonicalUrl ? new URL(canonicalUrl, GLOBAL_CONFIG.site.origin).toString() : undefined

  const base = {
    '@context': 'https://schema.org',
    '@type': type,
    description,
    headline: title,
    inLanguage: meta.lang ?? GLOBAL_CONFIG.lang ?? 'en',
    isPartOf: website,
    name: title,
    url,
    ...(modDate && { dateModified: modDate.toISOString() }),
    ...(pubDate && { datePublished: pubDate.toISOString() }),
  } as const

  if (isArticleOrBlog && author && typeof author === 'object') {
    const person = {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: author.url }),
    }

    return {
      ...base,
      author: [person],
      publisher,
    }
  }

  if (!isArticleOrBlog) {
    return { ...base, publisher }
  }

  return base
}

export function buildGraphJsonLd(meta: SeoMeta) {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebsiteJsonLd(), buildPageJsonLd(meta)],
  }
}
