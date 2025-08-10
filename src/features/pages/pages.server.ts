import { getContentDirectory } from '@/utils/collections'
import { sortByAccessorDateDesc } from '@/utils/content/normalize'
import { getCollection } from 'astro:content'
import type { PageFilterOptions } from './pages.types'
import { sortPages } from './pages.utils'

export async function getPublishedPages(options: PageFilterOptions = {}) {
  const {
    allowDrafts,
    customFilter,
    customSort,
    exclude = [],
    include,
    manualOrder,
    sortBy,
  } = options

  const pages = await getCollection('pages', (entry) => {
    const { id, data } = entry

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

    return true
  })

  // Extend shared sorter with server-only branches (order and pubDate)
  if (sortBy === 'order') {
    return pages.sort((a, b) => {
      const orderA = a.data.order ?? 999
      const orderB = b.data.order ?? 999
      if (orderA === orderB) {
        return a.data.title.localeCompare(b.data.title)
      }
      return orderA - orderB
    })
  }

  if (sortBy === 'pubDate') {
    return sortByAccessorDateDesc(pages, (p) => p.data.pubDatetime ?? 0)
  }

  return sortPages(pages, { sortBy, customSort, manualOrder })
}

// removed local sort helpers in favor of shared utils

export const getIdentityPages = (options: PageFilterOptions = {}) =>
  getPublishedPages({ ...options, include: ['i-am-a'] })
