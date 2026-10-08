import type { PageEntry, PageFilterOptions } from './pages.types'

import { getContentDirectory } from '@/utils/collections'

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

function matchesInclude(id: string, included: Set<string> | null) {
  if (!included) {
    return true
  }

  return included.has(id) || included.has(getContentDirectory(id))
}

function matchesPageFilter(entry: PageEntry, included: Set<string> | null) {
  if (entry.data.draft) {
    return false
  }

  return matchesInclude(entry.id, included)
}

function sortByOrder(pages: PageEntry[]) {
  return [...pages].sort(compareByOrder)
}

function sortByTitle(pages: PageEntry[]) {
  return [...pages].sort(compareByTitle)
}

const SORT_BY_FIELD = {
  order: sortByOrder,
  title: sortByTitle,
} as const

export function buildPagesFilter(options: PageFilterOptions = {}) {
  const included = options.include ? new Set(options.include) : null

  return (entry: PageEntry) => matchesPageFilter(entry, included)
}

export function resolvePageSeo(page: {
  data: Pick<PageEntry['data'], 'description' | 'seo' | 'title'>
  rendered?: { html?: string } | null
}) {
  const { description, seo, title } = page.data

  return {
    description: seo?.description || description || page.rendered?.html,
    ogImage: seo?.ogImage,
    title: seo?.title || title,
  }
}

export function sortPages(pages: PageEntry[], options: PageFilterOptions = {}): PageEntry[] {
  const { sortBy = 'title' } = options

  return SORT_BY_FIELD[sortBy](pages)
}
