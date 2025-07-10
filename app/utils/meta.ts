// Alternate solution: https://github.com/edmundhung/remix-guide/blob/main/app/helpers.ts#L7

import { SITE_URL } from '#app/constants'
import { createSiteUrl } from '#app/utils/misc'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Metadata = Record<string, any>

function cleanMeta(meta: Array<Metadata>): Array<Metadata> {
  return meta.filter((entry) => {
    const value = entry.content ?? entry.title ?? ''
    return value && value.trim() !== ''
  })
}

export function deriveMetaFromMetadata(metadata: Metadata): Array<Metadata> {
  return cleanMeta([
    { content: metadata.author, name: 'author' },
    { content: metadata.description, name: 'description' },
    { content: metadata.image, name: 'image' },
    { content: metadata.tags?.join(', '), name: 'keywords' },
    { title: metadata.title },
  ])
}

interface EnhanceMetaOptions {
  author: string
  pathname: string
  siteName: string
  twitterCard: string
  twitterSite: string
  type: string
}

export function createMetaEnhancer(defaultOptions: Omit<EnhanceMetaOptions, 'pathname'>) {
  return (meta: Array<Metadata>, options: Partial<EnhanceMetaOptions> = {}): Array<Metadata> => {
    const allOptions = { ...defaultOptions, ...options }
    const { author, siteName, twitterCard, twitterSite, type } = allOptions

    const metaAuthor = meta.find((entry) => entry.property === 'author')?.content || ''
    const metaDescription = meta.find((entry) => entry.name === 'description')?.content || ''
    const metaImage = meta.find((entry) => entry.property === 'image')?.content || ''
    const metaTitle = meta.find((entry) => entry.title)?.title || ''

    const title = metaTitle ? `${metaTitle} — ${siteName}` : siteName
    const url = createSiteUrl(allOptions.pathname)

    // Enhanced meta tags for social media and SEO
    const enhancedMeta = [
      { title: title },
      { content: metaAuthor ?? author, property: 'author' },
      { href: url, rel: 'canonical' },
      { content: '4jMDBbKyVQPMqqE3YYqw2vabnA3CR_uU9l2sOtRRmjM', name: 'google-site-verification' },
      { content: '#122023', property: 'theme-color' },
      { content: `${SITE_URL}/images/seo-banner.png`, property: 'image' },

      { content: metaDescription, property: 'og:description' },
      { content: metaImage, property: 'og:image' },
      { content: siteName, property: 'og:site_name' },
      { content: title, property: 'og:title' },
      { content: type, property: 'og:type' },
      { content: url, property: 'og:url' },

      { content: twitterCard, property: 'twitter:card' },
      { content: metaDescription, property: 'twitter:description' },
      { content: metaImage, property: 'twitter:image' },
      { content: twitterSite, property: 'twitter:site' },
      { content: title, property: 'twitter:title' },
    ]

    return cleanMeta([...meta, ...enhancedMeta])
  }
}

export const enhanceMeta = createMetaEnhancer({
  author: 'Luke McDonald',
  siteName: 'Luke McDonald',
  twitterCard: 'summary',
  twitterSite: '@thelukemcdonald',
  type: 'website',
})
