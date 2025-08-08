import { CONTENT_CONFIG } from '@/configs/content'

type CollectionKey = keyof typeof CONTENT_CONFIG.collections
type Collection<K extends CollectionKey> = (typeof CONTENT_CONFIG.collections)[K]

/**
 * Extract directory from content ID.
 *
 * @param id - Content ID (e.g., 'i-am-a/christian')
 * @returns Directory name or empty string for root-level content
 */
export function getContentDirectory(id: string): string {
  return id.includes('/') ? id.split('/')[0] : ''
}

/**
 * Get filename from content ID.
 *
 * @param id - Content ID (e.g., 'i-am-a/christian')
 * @returns Filename without directory
 */
export function getContentFilename(id: string): string {
  return id.includes('/') ? id.split('/').pop() || '' : id
}

/**
 * Get all available collection keys.
 * @returns Array of collection keys
 */
export function getCollectionKeys(): CollectionKey[] {
  return Object.keys(CONTENT_CONFIG.collections) as CollectionKey[]
}

/**
 * Get collection metadata.
 * @param key - The content key (e.g. 'blog', 'pages', etc)
 * @returns The collection object
 */
export function getCollectionMeta<K extends CollectionKey>(key: K): Collection<K> {
  return CONTENT_CONFIG.collections[key]
}

/**
 * Get collection name from a path.
 * @param path - The content path (e.g., 'src/content/pages')
 * @returns The collection name (e.g., 'pages')
 */
export function getCollectionName(path: string): string {
  return path.split('/').pop() || ''
}

/**
 * Check if a collection key exists.
 * @param key - The collection key to check
 * @returns True if the collection exists
 */
export function hasCollection(key: string): key is CollectionKey {
  return key in CONTENT_CONFIG.collections
}

/**
 * Check if content ID is in a specific directory.
 * @param id - Content ID
 * @param directory - Directory to check
 * @returns True if content is in the specified directory
 */
export function isInDirectory(id: string, directory: string): boolean {
  return getContentDirectory(id) === directory
}
