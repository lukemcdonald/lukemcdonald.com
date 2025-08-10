/**
 * Content helpers: ID normalization and generic date-based sorting.
 * Framework-agnostic and reusable across features.
 */
import { parseISO, isValid, compareDesc } from 'date-fns'

/** Remove known data file extensions from a content id */
export function stripDataExtension(id: string): string {
  return id.replace(/\.yaml$/i, '')
}

/** Split a content id into section and nested itemId */
export function parseContentId(id: string): {
  section: string
  itemId: string
  isTopLevel: boolean
} {
  const base = stripDataExtension(id)
  const parts = base.split('/')
  const section = parts[0] || ''
  const itemId = parts.slice(1).join('/')
  return { section, itemId, isTopLevel: parts.length === 1 }
}

/** Extract the primary date key (date or startDate) as a string */
type DateLike = Date | string | number | null | undefined

function hasDateFields(x: unknown): x is { date?: DateLike; startDate?: DateLike } {
  return typeof x === 'object' && x !== null && ('date' in x || 'startDate' in x)
}

export function getDateKey(input: unknown): string {
  if (hasDateFields(input)) {
    const value = input.date ?? input.startDate ?? ''
    return typeof value === 'string' ? value : String(value ?? '')
  }
  return ''
}

export function toDate(value: DateLike): Date | null {
  if (value instanceof Date) return isValid(value) ? value : null
  if (typeof value === 'string') {
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : null
  }
  if (typeof value === 'number') {
    const d = new Date(value)
    return isValid(d) ? d : null
  }
  return null
}

export function getByPath(obj: unknown, path: string): unknown {
  if (obj === null || typeof obj !== 'object') return undefined
  const segments = path.split('.')
  let current: unknown = obj
  for (const key of segments) {
    if (current === null || typeof current !== 'object') return undefined
    const record = current as Record<string, unknown>
    current = record[key]
  }
  return current
}

export function firstDefinedByPaths(obj: unknown, paths: string[]): unknown {
  for (const p of paths) {
    const v = getByPath(obj, p)
    if (v !== undefined) return v
  }
  return undefined
}

/** Stable copy sort by date/startDate descending */
export function sortByAccessorDateDesc<T>(items: T[], accessor: (item: T) => DateLike) {
  return [...items].sort((a, b) => {
    const ad = toDate(accessor(a))
    const bd = toDate(accessor(b))
    if (!ad && !bd) return 0
    if (!ad) return 1
    if (!bd) return -1
    return compareDesc(ad, bd)
  })
}

export function sortByDateKeysDesc<T>(items: T[], dateKeys: string[]) {
  return sortByAccessorDateDesc(items, (item) => {
    const v = firstDefinedByPaths(item, dateKeys)
    return v instanceof Date || typeof v === 'string' || typeof v === 'number' ? v : undefined
  })
}

// Backward-compatible convenience for resume-like data (date or startDate)
export function sortByDateDesc<T>(items: T[], getValue?: (item: T) => DateLike) {
  if (getValue) {
    return sortByAccessorDateDesc(items, getValue)
  }
  return sortByDateKeysDesc(items, ['date', 'startDate'])
}
