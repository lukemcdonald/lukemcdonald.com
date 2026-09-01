import type { DateLike } from './index'

import { compareNullableDateDesc } from './compareNullableDateDesc'
import { toDate } from './toDate'

/**
 * Sort items by date/startDate descending using an accessor function
 * @param items - The items to sort
 * @param accessor - The accessor function to get the date
 * @returns The sorted items
 */
export function sortByAccessorDateDesc<T>(items: T[], accessor: (item: T) => DateLike): T[] {
  return [...items].sort((a, b) => {
    return compareNullableDateDesc(toDate(accessor(a)), toDate(accessor(b)))
  })
}
