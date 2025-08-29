import type { SeoContentType, SeoMeta } from './types'
import type { GLOBAL_CONFIG } from '@/configs/global'

const OG_TYPE_MAP: Record<SeoContentType, string> = {
  article: 'article',
  blog: 'article',
  page: 'website',
} as const

export function getSocialImageUrl(ogImage?: string, siteUrl?: string): string {
  return ogImage || `${siteUrl}/og-image.jpg`
}

export function buildSocialMetaTags(meta: SeoMeta, site: typeof GLOBAL_CONFIG) {
  const { canonicalUrl, contentType = 'page', description, ogImage, title } = meta
  const socialImageUrl = getSocialImageUrl(ogImage, site.site.origin)
  const ogType = OG_TYPE_MAP[contentType]
  const absoluteCanonical =
    canonicalUrl ? new URL(canonicalUrl, site.site.origin).toString() : undefined

  return {
    // Open Graph / Facebook
    'og:description': description,
    'og:image': socialImageUrl,
    'og:site_name': site.name,
    'og:title': title,
    'og:type': ogType,
    'og:url': absoluteCanonical,

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': socialImageUrl,
    'twitter:title': title,
    'twitter:url': absoluteCanonical,
  }
}
