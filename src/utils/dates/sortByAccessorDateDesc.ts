import { compareDesc } from 'date-fns'
import type { DateLike } from './index'
import { toDate } from './toDate'

/**
 * Sort items by date/startDate descending using an accessor function
 * @param items - The items to sort
 * @param accessor - The accessor function to get the date
 * @returns The sorted items
 */
export function sortByAccessorDateDesc<T>(items: T[], accessor: (item: T) => DateLike): T[] {
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
