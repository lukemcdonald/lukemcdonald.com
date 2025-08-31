import type { DateLike } from './index'

import { toDate } from './toDate'

/**
 * Format a date-like value as Mon YYYY (e.g., Jan 2023).
 * Returns null if the input cannot be parsed as a valid date.
 */
export function formatMonthYear(input: unknown): string | null {
  const date = toDate(input as DateLike)

  if (!date) {
    return null
  }

  // Use fixed en-US month and UTC to avoid TZ skew at midnight.
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).replace(/\.$/, '')
  const year = date.getUTCFullYear()

  return `${month} ${year}`
}
