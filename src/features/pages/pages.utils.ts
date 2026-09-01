import type { PageEntry, PageFilterOptions, PageSortOptions } from './pages.types'

import { getContentDirectory } from '@/utils/collections'
import { sortByAccessorDateDesc, toDate } from '@/utils/dates'

type PagesFilterContext = {
  allowDrafts: boolean
  customFilter?: (entry: PageEntry) => boolean
  excluded: Set<string>
  included: Set<string> | null
  max: Date | null
  min: Date | null
}

function compareByOrder(a: PageEntry, b: PageEntry) {
  const orderA = a.data.order ?? 999
  const orderB = b.data.order ?? 999

  if (orderA === orderB) {
    return a.data.title.localeCompare(b.data.title)
  }

  return orderA - orderB
}

function compareByTitle(a: PageEntry, b: PageEntry) {
  return a.data.title.localeCompare(b.data.title)
}

function tightenMax(current: Date | null, bound: Date | null) {
  if (!bound) {
    return current
  }

  if (!current || bound < current) {
    return bound
  }

  return current
}

function tightenMin(current: Date | null, bound: Date | null) {
  if (!bound) {
    return current
  }

  if (!current || bound > current) {
    return bound
  }

  return current
}

function toOptionalDate(value?: Date | string | number) {
  if (value == null) {
    return null
  }

  return toDate(value)
}

function getPubDateWindow(options: PageFilterOptions) {
  const now = new Date()

  return {
    max: tightenMax(toOptionalDate(options.dateTo), options.hideFuture ? now : null),
    min: tightenMin(toOptionalDate(options.dateFrom), options.hidePast ? now : null),
  }
}

function isAfterMin(pub: Date, min: Date | null) {
  return !min || pub >= min
}

function isBeforeMax(pub: Date, max: Date | null) {
  return !max || pub <= max
}

function isWithinPubDateWindow(pub: Date | null, min: Date | null, max: Date | null) {
  if (!pub) {
    return true
  }

  return isAfterMin(pub, min) && isBeforeMax(pub, max)
}

function matchesInclude(id: string, included: Set<string> | null) {
  if (!included) {
    return true
  }

  return included.has(id) || included.has(getContentDirectory(id))
}

function matchesMembership(id: string, included: Set<string> | null, excluded: Set<string>) {
  return matchesInclude(id, included) && !excluded.has(id)
}

function passesCustomFilter(entry: PageEntry, customFilter?: PagesFilterContext['customFilter']) {
  return !customFilter || customFilter(entry)
}

function passesDraftPolicy(isDraft: boolean, allowDrafts: boolean) {
  return allowDrafts || !isDraft
}

function passesIdentityFilters(entry: PageEntry, context: PagesFilterContext) {
  const { allowDrafts, customFilter, excluded, included } = context

  if (!passesDraftPolicy(entry.data.draft, allowDrafts)) {
    return false
  }

  if (!matchesMembership(entry.id, included, excluded)) {
    return false
  }

  return passesCustomFilter(entry, customFilter)
}

function matchesPageFilter(entry: PageEntry, context: PagesFilterContext) {
  if (!passesIdentityFilters(entry, context)) {
    return false
  }

  return isWithinPubDateWindow(toDate(entry.data.pubDate ?? null), context.min, context.max)
}

function sortByCustom(pages: PageEntry[], customSort?: PageSortOptions['customSort']) {
  if (!customSort) {
    throw new Error('Custom sort function is required when sortBy is "custom"')
  }

  return [...pages].sort(customSort)
}

function sortByDate(pages: PageEntry[]) {
  return sortByAccessorDateDesc(pages, (page) => page.data.pubDate ?? null)
}

function sortByManual(pages: PageEntry[], manualOrder?: string[]) {
  if (!manualOrder || manualOrder.length === 0) {
    throw new Error('Manual order array is required when sortBy is "manual"')
  }

  const orderMap = new Map(manualOrder.map((id, index) => [id, index]))

  return [...pages].sort((a, b) => {
    const rankA = orderMap.get(a.id) ?? Number.POSITIVE_INFINITY
    const rankB = orderMap.get(b.id) ?? Number.POSITIVE_INFINITY

    if (rankA !== rankB) {
      return rankA - rankB
    }

    return compareByTitle(a, b)
  })
}

function sortByOrder(pages: PageEntry[]) {
  return [...pages].sort(compareByOrder)
}

function sortByTitle(pages: PageEntry[]) {
  return [...pages].sort(compareByTitle)
}

const SORT_BY_FIELD = {
  date: sortByDate,
  order: sortByOrder,
  title: sortByTitle,
} as const

export function buildPagesFilter(options: PageFilterOptions = {}) {
  const { allowDrafts = false, customFilter, exclude = [], include } = options
  const { max, min } = getPubDateWindow(options)
  const context: PagesFilterContext = {
    allowDrafts,
    customFilter,
    excluded: new Set(exclude),
    included: include ? new Set(include) : null,
    max,
    min,
  }

  return (entry: PageEntry) => matchesPageFilter(entry, context)
}

export function sortPages(pages: PageEntry[], options: PageSortOptions = {}): PageEntry[] {
  const { customSort, manualOrder, sortBy = 'title' } = options

  if (sortBy === 'custom') {
    return sortByCustom(pages, customSort)
  }

  if (sortBy === 'manual') {
    return sortByManual(pages, manualOrder)
  }

  return SORT_BY_FIELD[sortBy](pages)
}
