import { compareDesc, isValid, parseISO } from 'date-fns'

export type DateLike = Date | string | number | null | undefined

type HasEndDate = {
  endDate?: string | null
}

function compareNullableDateDesc(a: Date | null, b: Date | null) {
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

function firstDefinedByPaths(obj: unknown, paths: string[]): unknown {
  for (const path of paths) {
    const value = getByPath(obj, path)

    if (value !== undefined) {
      return value
    }
  }

  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function getByPath(obj: unknown, path: string): unknown {
  if (!isRecord(obj)) {
    return undefined
  }

  let current: unknown = obj

  for (const key of path.split('.')) {
    if (!isRecord(current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

function isPresent(endDate?: string | null) {
  return Boolean(!endDate || endDate.toLowerCase() === 'present')
}

function validDateOrNull(value: Date) {
  if (!isValid(value)) {
    return null
  }

  return value
}

function parseDateNumber(value: number) {
  return validDateOrNull(new Date(value))
}

function parseDateString(value: string) {
  const parsed = parseISO(value)

  if (isValid(parsed)) {
    return parsed
  }

  return validDateOrNull(new Date(value))
}

function sortByDateKeysDesc<T>(items: T[], dateKeys: string[]): T[] {
  return sortByAccessorDateDesc(items, (item) => {
    const value = firstDefinedByPaths(item, dateKeys)

    if (value instanceof Date || typeof value === 'string' || typeof value === 'number') {
      return value
    }

    return undefined
  })
}

export function formatMonthYear(input: unknown): string | null {
  const date = toDate(input as DateLike)

  if (!date) {
    return null
  }

  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).replace(/\.$/, '')
  const year = date.getUTCFullYear()

  return `${month} ${year}`
}

export function sortByAccessorDateDesc<T>(items: T[], accessor: (item: T) => DateLike): T[] {
  return [...items].sort((a, b) => {
    return compareNullableDateDesc(toDate(accessor(a)), toDate(accessor(b)))
  })
}

export function sortByDateDesc<T>(items: T[], getValue?: (item: T) => DateLike): T[] {
  if (getValue) {
    return sortByAccessorDateDesc(items, getValue)
  }

  return sortByDateKeysDesc(items, ['date', 'startDate'])
}

export function sortExperienceByEndDate<T extends HasEndDate>(items: T[]): T[] {
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

export function toDate(value: DateLike): Date | null {
  if (value instanceof Date) {
    return validDateOrNull(value)
  }

  if (typeof value === 'string') {
    return parseDateString(value)
  }

  if (typeof value === 'number') {
    return parseDateNumber(value)
  }

  return null
}
