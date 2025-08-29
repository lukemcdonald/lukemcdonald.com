import type { DateLike } from './index'

import { sortByAccessorDateDesc } from './sortByAccessorDateDesc'

/**
 * Get a value by path from an object
 * @param obj - The object to get the value from
 * @param path - The path to the value
 * @returns The value, or undefined if the path is invalid
 */
function getByPath(obj: unknown, path: string): unknown {
  if (obj === null || typeof obj !== 'object') {
    return undefined
  }

  const segments = path.split('.')
  let current: unknown = obj

  for (const key of segments) {
    if (current === null || typeof current !== 'object') {
      return undefined
    }
    const record = current as Record<string, unknown>
    current = record[key]
  }

  return current
}

/**
 * Get the first defined value from multiple paths
 * @param obj - The object to check
 * @param paths - The paths to check
 * @returns The first defined value, or undefined if none found
 */
function firstDefinedByPaths(obj: unknown, paths: string[]): unknown {
  for (const p of paths) {
    const v = getByPath(obj, p)
    if (v !== undefined) {
      return v
    }
  }
  return undefined
}

/**
 * Sort items by date keys descending
 * @param items - The items to sort
 * @param dateKeys - The date keys to sort by
 * @returns The sorted items
 */
function sortByDateKeysDesc<T>(items: T[], dateKeys: string[]): T[] {
  return sortByAccessorDateDesc(items, (item) => {
    const v = firstDefinedByPaths(item, dateKeys)
    return v instanceof Date || typeof v === 'string' || typeof v === 'number' ? v : undefined
  })
}

/**
 * Sort items by date/startDate descending
 * @param items - The items to sort
 * @param getValue - The accessor function to get the date
 * @returns The sorted items
 */
export function sortByDateDesc<T>(items: T[], getValue?: (item: T) => DateLike): T[] {
  if (getValue) {
    return sortByAccessorDateDesc(items, getValue)
  }
  return sortByDateKeysDesc(items, ['date', 'startDate'])
}
