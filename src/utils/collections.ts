import { CONTENT_PATHS } from '@/configs/content'

/**
 * Get all available collection keys
 * @returns Array of collection keys
 */
export function getCollectionKeys(): (keyof typeof CONTENT_PATHS)[] {
  return Object.keys(CONTENT_PATHS) as (keyof typeof CONTENT_PATHS)[]
}

/**
 * Get collection name from a path
 * @param path - The content path (e.g., 'src/content/pages')
 * @returns The collection name (e.g., 'pages')
 */
export function getCollectionName(path: string): string {
  return path.split('/').pop() || ''
}

/**
 * Get collection name for a specific content key
 * @param key - The content key (e.g. 'blog', 'pages', etc)
 * @returns The collection name for that content type
 */
export function getCollectionNameByKey(key: keyof typeof CONTENT_PATHS): string {
  return getCollectionName(CONTENT_PATHS[key])
}

/**
 * Get collection path for a specific content key
 * @param key - The content key (e.g. 'blog', 'pages', etc)
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

/**
 * Extract directory from content ID
 * @param id - Content ID (e.g., 'i-am-a/christian')
 * @returns Directory name or empty string for root-level content
 */
export function getContentDirectory(id: string): string {
  return id.includes('/') ? id.split('/')[0] : ''
}

/**
 * Check if content ID is in a specific directory
 * @param id - Content ID
 * @param directory - Directory to check
 * @returns True if content is in the specified directory
 */
export function isInDirectory(id: string, directory: string): boolean {
  return getContentDirectory(id) === directory
}

/**
 * Get filename from content ID
 * @param id - Content ID (e.g., 'i-am-a/christian')
 * @returns Filename without directory
 */
export function getContentFilename(id: string): string {
  return id.includes('/') ? id.split('/').pop() || '' : id
}
