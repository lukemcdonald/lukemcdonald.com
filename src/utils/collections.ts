import { CONTENT_CONFIG } from '@/configs/content'

type CollectionKey = keyof typeof CONTENT_CONFIG.collections
type Collection<K extends CollectionKey> = (typeof CONTENT_CONFIG.collections)[K]

/**
 * Extract directory from content ID.
 * @param id - Content ID (e.g., 'i-am-a/christian')
 * @returns Directory name or empty string for root-level content
 */
export function getContentDirectory(id: string): string {
  return id.includes('/') ? id.split('/')[0] : ''
}

/**
 * Get collection metadata.
 * @param key - The content key (e.g. 'blog', 'pages', etc)
 * @returns The collection object
 */
export function getCollectionMeta<K extends CollectionKey>(key: K): Collection<K> {
  return CONTENT_CONFIG.collections[key]
}
