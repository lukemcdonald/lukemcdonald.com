import type { SeoMeta } from './types'
import type { GLOBAL_CONFIG } from '@/configs/global'

export function getSocialImageUrl(ogImage?: string, siteUrl?: string): string {
  return ogImage || `${siteUrl}/og-image.jpg`
}

export function buildSocialMetaTags(meta: SeoMeta, site: typeof GLOBAL_CONFIG) {
  const { canonicalUrl, contentType, description, ogImage, title } = meta
  const socialImageURL = getSocialImageUrl(ogImage, site.site.origin)
  const ogType = contentType === 'article' || contentType === 'blog' ? 'article' : 'website'
  const absoluteCanonical =
    canonicalUrl ? new URL(canonicalUrl, site.site.origin).toString() : undefined

  return {
    // Open Graph / Facebook
    'og:description': description,
    'og:image': socialImageURL,
    'og:site_name': site.name,
    'og:title': title,
    'og:type': ogType,
    'og:url': absoluteCanonical,

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:description': description,
    'twitter:image': socialImageURL,
    'twitter:title': title,
    'twitter:url': absoluteCanonical,
  }
}
