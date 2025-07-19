import { CONTENT_PATHS } from '../config'

/**
 * Get all available collection keys
 * @returns Array of collection keys
 */
export function getCollectionKeys(): (keyof typeof CONTENT_PATHS)[] {
  return Object.keys(CONTENT_PATHS) as (keyof typeof CONTENT_PATHS)[]
}

/**
 * Get collection name from a path
 * @param path - The content path (e.g., 'src/content/i-am-a')
 * @returns The collection name (e.g., 'i-am-a')
 */
export function getCollectionName(path: string): string {
  return path.split('/').pop() || ''
}

/**
 * Get collection name for a specific content key
 * @param key - The content key (e.g., 'identity', 'main', 'blog')
 * @returns The collection name for that content type
 */
export function getCollectionNameByKey(key: keyof typeof CONTENT_PATHS): string {
  return getCollectionName(CONTENT_PATHS[key])
}

/**
 * Get collection path for a specific content key
 * @param key - The content key (e.g., 'identity', 'main', 'blog')
 * @returns The collection path for that content type
 */
export function getCollectionPath(key: keyof typeof CONTENT_PATHS): string {
  return CONTENT_PATHS[key]
}

/**
 * Check if a collection key exists
 * @param key - The collection key to check
 * @returns True if the collection exists
 */
export function hasCollection(key: string): key is keyof typeof CONTENT_PATHS {
  return key in CONTENT_PATHS
}
