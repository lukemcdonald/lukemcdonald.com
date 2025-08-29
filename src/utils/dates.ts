import { compareDesc, isValid, parseISO } from 'date-fns'

export type DateLike = Date | string | number | null | undefined

/**
 * Check if an object has date fields
 * @param x - The object to check
 * @returns True if the object has date fields
 */
function hasDateFields(x: unknown): x is { date?: DateLike; startDate?: DateLike } {
  return typeof x === 'object' && x !== null && ('date' in x || 'startDate' in x)
}

/**
 * Get the primary date key (date or startDate) as a string
 * @param input - The object to check
 * @returns The primary date key
 */
export function getDateKey(input: unknown): string {
  if (hasDateFields(input)) {
    const value = input.date ?? input.startDate ?? ''
    const d = toDate(value as DateLike)
    return (
      d ? d.toISOString()
      : typeof value === 'string' ? value
      : ''
    )
  }
  return ''
}

/**
 * Convert a date-like value to a Date object
 * @param value - The date-like value to convert
 * @returns The Date object, or null if the value is invalid
 */
export function toDate(value: DateLike): Date | null {
  if (value instanceof Date) {
    return isValid(value) ? value : null
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value)
    if (isValid(parsed)) {
      return parsed
    }
    const loose = new Date(value)
    return isValid(loose) ? loose : null
  }

  if (typeof value === 'number') {
    const d = new Date(value)
    return isValid(d) ? d : null
  }

  return null
}

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
 * Sort items by date/startDate descending using an accessor function
 * @param items - The items to sort
 * @param accessor - The accessor function to get the date
 * @returns The sorted items
 */
export function sortByAccessorDateDesc<T>(items: T[], accessor: (item: T) => DateLike) {
  return [...items].sort((a, b) => {
    const ad = toDate(accessor(a))
    const bd = toDate(accessor(b))
    if (!ad && !bd) {
      return 0
    }
    if (!ad) {
      return 1
    }
    if (!bd) {
      return -1
    }
    return compareDesc(ad, bd)
  })
}

/**
 * Sort items by date keys descending
 * @param items - The items to sort
 * @param dateKeys - The date keys to sort by
 * @returns The sorted items
 */
function sortByDateKeysDesc<T>(items: T[], dateKeys: string[]) {
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
export function sortByDateDesc<T>(items: T[], getValue?: (item: T) => DateLike) {
  if (getValue) {
    return sortByAccessorDateDesc(items, getValue)
  }
  return sortByDateKeysDesc(items, ['date', 'startDate'])
}
