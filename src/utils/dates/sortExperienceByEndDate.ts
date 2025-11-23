import type { ExperienceItem } from '@/features/resume/resume.types'

import { compareDesc } from 'date-fns'

import { toDate } from './toDate'

/**
 * Check if an endDate represents a "Present" position
 * @param endDate - The endDate value to check
 * @returns True if the endDate represents a present position
 */
function isPresent(endDate?: string | null) {
  return Boolean(!endDate || endDate?.toLowerCase() === 'present')
}

/**
 * Sort experience items by endDate with "Present" positions first,
 * then by endDate descending (most recent first)
 * @param items - The experience items to sort
 * @returns The sorted experience items
 */
export function sortExperienceByEndDate(items: ExperienceItem[]): ExperienceItem[] {
  return [...items].sort((a, b) => {
    const aIsPresent = isPresent(a.endDate)
    const bIsPresent = isPresent(b.endDate)

    // Present positions come first
    if (aIsPresent && !bIsPresent) {
      return -1
    }
    if (!aIsPresent && bIsPresent) {
      return 1
    }

    // If both are present, maintain original order
    if (aIsPresent && bIsPresent) {
      return 0
    }

    // Both have end dates - sort by endDate descending
    const aDate = toDate(a.endDate)
    const bDate = toDate(b.endDate)

    if (!aDate && !bDate) {
      return 0
    }
    if (!aDate) {
      return 1
    }
    if (!bDate) {
      return -1
    }

    return compareDesc(aDate, bDate)
  })
}
