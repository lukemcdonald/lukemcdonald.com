import type { DateLike } from './index'

import { toDate } from './toDate'

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
