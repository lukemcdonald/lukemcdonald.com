import type { PageEntry, PageFilterOptions } from './pages.types'

import { getCollection } from 'astro:content'

import { getContentDirectory } from '@/utils/collections'
import { sortByAccessorDateDesc, toDate } from '@/utils/dates'

import { sortPages } from './pages.utils'

export function buildPagesFilter(options: PageFilterOptions = {}) {
  const {
    allowDrafts = false,
    customFilter,
    dateFrom,
    dateTo,
    exclude = [],
    hideFuture,
    hidePast,
    include,
  } = options

  return (entry: PageEntry) => {
    const { data, id } = entry

    if (!allowDrafts && data.draft) {
      return false
    }

    if (include) {
      const pageDirectory = getContentDirectory(id)
      const isIncluded = include.some((item) => item === id || item === pageDirectory)

      if (!isIncluded) {
        return false
      }
    }

    if (exclude.includes(id)) {
      return false
    }

    if (customFilter && !customFilter(entry)) {
      return false
    }

    const pub = toDate(data.pubDate ?? null)

    if (pub && dateFrom) {
      const from = toDate(dateFrom)
      if (from && pub < from) {
        return false
      }
    }

    if (dateTo && pub) {
      const to = toDate(dateTo)
      if (to && pub > to) {
        return false
      }
    }

    if (hideFuture && pub) {
      const now = new Date()
      if (pub > now) {
        return false
      }
    }

    if (hidePast && pub) {
      const now = new Date()
      if (pub < now) {
        return false
      }
    }

    return true
  }
}

export function sortPagesServer(pages: PageEntry[], options: PageFilterOptions = {}) {
  const { customSort, manualOrder, sortBy } = options

  if (sortBy === 'order') {
    return [...pages].sort((a, b) => {
      const orderA = a.data.order ?? 999
      const orderB = b.data.order ?? 999
      if (orderA === orderB) {
        return a.data.title.localeCompare(b.data.title)
      }
      return orderA - orderB
    })
  }

  if (sortBy === 'date') {
    return sortByAccessorDateDesc(pages, (p) => p.data.pubDate ?? 0)
  }

  return sortPages(pages, { customSort, manualOrder, sortBy })
}

export async function getPublishedPages(options: PageFilterOptions = {}) {
  const filter = buildPagesFilter(options)
  const pages = await getCollection('pages', filter)
  return sortPagesServer(pages, options)
}
