import { compareDesc } from 'date-fns'

export function compareNullableDateDesc(a: Date | null, b: Date | null) {
  if (!a) {
    if (!b) {
      return 0
    }

    return 1
  }

  if (!b) {
    return -1
  }

  return compareDesc(a, b)
}
