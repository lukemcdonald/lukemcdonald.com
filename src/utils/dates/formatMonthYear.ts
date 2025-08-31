import { isValid } from 'date-fns'

import { toDate } from './toDate'

/**
 * Format a date-like value as Mon YYYY (e.g., Jan 2023).
 * Returns null if the input cannot be parsed as a valid date.
 */
export function formatMonthYear(input: unknown): string | null {
  const d = toDate(input as never)
  if (!d || !isValid(d)) {
    return null
  }

  // Use a fixed en-US short month for resume readability.
  // Avoid toLocaleDateString variability by specifying locale-independent options.
  const month = d.toLocaleString('en-US', { month: 'short' }).replace('.', '') // Normalize locales that add periods (e.g., "Sept.")
  const year = d.getFullYear()
  return `${month} ${year}`
}
