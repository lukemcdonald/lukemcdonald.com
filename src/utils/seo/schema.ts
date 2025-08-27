import type { SeoMeta } from './types'
import type { GLOBAL_CONFIG } from '@/configs/global'

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
  const pageLang = meta.lang ?? config.lang ?? 'en'

  const type =
    contentType === 'article' ? 'Article'
    : contentType === 'blog' ? 'BlogPosting'
    : 'WebPage'

  const base = {
    '@context': 'https://schema.org',
    '@type': type,
    description,
    headline: title,
    inLanguage: pageLang,
    isPartOf: {
      '@type': 'WebSite',
      name: config.name,
      url: config.site.origin,
    },
    name: title,
    url: canonicalUrl ? new URL(canonicalUrl, config.site.origin).toString() : undefined,
    ...(modDatetime && { dateModified: modDatetime.toISOString() }),
    ...(pubDatetime && { datePublished: pubDatetime.toISOString() }),
  } as const

  const isArticleOrBlog = type === 'Article' || type === 'BlogPosting'

  if (isArticleOrBlog && author && typeof author === 'object') {
    return {
      ...base,
      author: [
        {
          '@type': 'Person',
          name: author.name,
          ...(author.url && { url: author.url }),
        },
      ],
      publisher: {
        '@type': 'Organization',
        name: config.name,
        url: config.site.origin,
      },
    }
  }

  if (!isArticleOrBlog) {
    return {
      ...base,
      publisher: {
        '@type': 'Organization',
        name: config.name,
        url: config.site.origin,
      },
    }
  }

  return base
}

export function buildGraphJsonLd(meta: SeoMeta, config: typeof GLOBAL_CONFIG) {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebsiteJsonLd(config), buildPageJsonLd(meta, config)],
  }
}
