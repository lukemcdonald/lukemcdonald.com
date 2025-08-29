import type { SeoContentType, SeoMeta } from './types'
import type { GLOBAL_CONFIG } from '@/configs/global'

type SchemaType = 'Article' | 'BlogPosting' | 'WebPage'

const CONTENT_TYPE_MAP: Record<SeoContentType, SchemaType> = {
  article: 'Article',
  blog: 'BlogPosting',
  page: 'WebPage',
} as const

export function buildWebsiteJsonLd(config: typeof GLOBAL_CONFIG) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    alternateName: new URL(config.site.origin).hostname,
    name: config.name,
    url: config.site.origin,
  }
}

export function buildPageJsonLd(meta: SeoMeta, config: typeof GLOBAL_CONFIG) {
  const {
    author,
    canonicalUrl,
    contentType = 'page',
    description,
    modDatetime,
    pubDatetime,
    title,
  } = meta

  const type = CONTENT_TYPE_MAP[contentType]
  const isArticleOrBlog = type === 'Article' || type === 'BlogPosting'

  const publisher = {
    '@type': 'Organization',
    name: config.name,
    url: config.site.origin,
  }

  const website = {
    '@type': 'WebSite',
    name: config.name,
    url: config.site.origin,
  }

  const url = canonicalUrl ? new URL(canonicalUrl, config.site.origin).toString() : undefined

  const base = {
    '@context': 'https://schema.org',
    '@type': type,
    description,
    headline: title,
    inLanguage: meta.lang ?? config.lang ?? 'en',
    isPartOf: website,
    name: title,
    url,
    ...(modDatetime && { dateModified: modDatetime.toISOString() }),
    ...(pubDatetime && { datePublished: pubDatetime.toISOString() }),
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

export function buildGraphJsonLd(meta: SeoMeta, config: typeof GLOBAL_CONFIG) {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebsiteJsonLd(config), buildPageJsonLd(meta, config)],
  }
}
