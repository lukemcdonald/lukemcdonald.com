export const ENTRY_IMAGE_FIT = 'cover'
export const ENTRY_IMAGE_QUALITY = 75
export const ENTRY_IMAGE_SIZES = '(min-width: 1024px) 50vw, 100vw'
export const ENTRY_IMAGE_WIDTHS = [480, 768, 1024]

export function toPageHref(id: string): string {
  if (id === 'index') {
    return '/'
  }

  return `/${id}`
}
