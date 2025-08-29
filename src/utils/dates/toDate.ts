import type { DateLike } from './index'

import { isValid, parseISO } from 'date-fns'

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
