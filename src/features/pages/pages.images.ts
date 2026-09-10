import type { ImageMetadata } from 'astro'

export const ENTRY_IMAGE_FIT = 'cover'
export const ENTRY_IMAGE_QUALITY = 75
export const ENTRY_IMAGE_SIZES = '(min-width: 1024px) 50vw, 100vw'
export const ENTRY_IMAGE_WIDTHS = [480, 768, 1024]

const NON_IDENT_CHARS = /[^a-zA-Z0-9_-]+/g

export function getEntryImageTransitionName(image: Pick<ImageMetadata, 'src'>): string {
  const filename = image.src.split('/').pop() ?? 'image'
  const base = filename
    .replace(/\.[^.]+$/, '')
    .replace(NON_IDENT_CHARS, '-')
    .replace(/^-+|-+$/g, '')

  return `entry-image-${base || 'image'}`
}

export function toPageHref(id: string): string {
  if (id === 'index') {
    return '/'
  }

  return `/${id}`
}
