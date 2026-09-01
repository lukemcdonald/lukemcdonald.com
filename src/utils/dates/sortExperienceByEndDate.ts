import type { ExperienceItem } from '@/features/resume/resume.types'

import { compareNullableDateDesc } from './compareNullableDateDesc'
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

    if (aIsPresent !== bIsPresent) {
      if (aIsPresent) {
        return -1
      }

      return 1
    }

    if (aIsPresent) {
      return 0
    }

    return compareNullableDateDesc(toDate(a.endDate), toDate(b.endDate))
  })
}
