import { getContentDirectory } from '@/utils/collections'
import { sortByAccessorDateDesc } from '@/utils/content/normalize'
import { getCollection, type CollectionEntry } from 'astro:content'

export type SortBy = 'title' | 'order' | 'pubDate' | 'custom' | 'manual'

export interface PageFilterOptions {
  /** Whether to include draft pages (default: false) */
  allowDrafts?: boolean
  /** Custom filter function for advanced filtering */
  customFilter?: (entry: CollectionEntry<'pages'>) => boolean
  /** Exclude specific page IDs */
  exclude?: string[]
  /** Include pages from these directories or specific page IDs */
  include?: string[]
  /** How to sort the results (default: 'title') */
  sortBy?: SortBy
  /** Custom sort function (used when sortBy is 'custom') */
  customSort?: (a: CollectionEntry<'pages'>, b: CollectionEntry<'pages'>) => number
  /** Manual order array (used when sortBy is 'manual') */
  manualOrder?: string[]
}

/**
 * Get pages with flexible filtering options
 */
export async function getPublishedPages(options: PageFilterOptions = {}) {
  const {
    allowDrafts = false,
    customFilter,
    exclude = [],
    include,
    sortBy = 'title',
    customSort,
    manualOrder,
  } = options

  const pages = await getCollection('pages', (entry) => {
    const { id, data } = entry

    // Draft filtering
    if (!allowDrafts && data.draft) {
      return false
    }

    // Include filtering (directories or specific page IDs)
    if (include) {
      const pageDirectory = getContentDirectory(id)
      const isIncluded = include.some((item) => item === id || item === pageDirectory)
      if (!isIncluded) {
        return false
      }
    }

    // Exclude specific pages
    if (exclude.includes(id)) {
      return false
    }

    // Custom filter
    if (customFilter && !customFilter(entry)) {
      return false
    }

    return true
  })

  // Apply sorting
  return sortPages(pages, sortBy, customSort, manualOrder)
}

/**
 * Helper function to sort pages by title
 */
function sortByTitle(pages: CollectionEntry<'pages'>[]): CollectionEntry<'pages'>[] {
  return pages.sort((a, b) => a.data.title.localeCompare(b.data.title))
}

/**
 * Sorts pages based on the specified criteria
 * @param pages - Array of page entries to sort
 * @param sortBy - Sort method to use
 * @param customSort - Required when sortBy is 'custom'
 * @param manualOrder - Required when sortBy is 'manual'
 */
function sortPages(
  pages: CollectionEntry<'pages'>[],
  sortBy: SortBy,
  customSort?: (a: CollectionEntry<'pages'>, b: CollectionEntry<'pages'>) => number,
  manualOrder?: string[],
): CollectionEntry<'pages'>[] {
  switch (sortBy) {
    case 'title':
      return sortByTitle(pages)

    case 'order':
      return pages.sort((a, b) => {
        const orderA = a.data.order ?? 999
        const orderB = b.data.order ?? 999
        if (orderA === orderB) {
          return a.data.title.localeCompare(b.data.title)
        }
        return orderA - orderB
      })

    case 'pubDate':
      return sortByAccessorDateDesc(pages, (p) => p.data.pubDatetime ?? 0)

    case 'custom':
      if (!customSort) {
        throw new Error('Custom sort function is required when sortBy is "custom"')
      }
      return pages.sort(customSort)

    case 'manual':
      if (!manualOrder || manualOrder.length === 0) {
        throw new Error('Manual order array is required when sortBy is "manual"')
      }

      const orderMap = new Map(manualOrder.map((id, index) => [id, index]))

      return pages.sort((a, b) => {
        const indexA = orderMap.get(a.id)
        const indexB = orderMap.get(b.id)

        // If both are in manual order, sort by their position
        if (indexA !== undefined && indexB !== undefined) {
          return indexA - indexB
        }

        // Items in manual order come first
        if (indexA !== undefined) {
          return -1
        }
        if (indexB !== undefined) {
          return 1
        }

        // Items not in manual order fall back to title sort
        return a.data.title.localeCompare(b.data.title)
      })

    default:
      return sortByTitle(pages)
  }
}

export const getIdentityPages = (options: PageFilterOptions = {}) =>
  getPublishedPages({ ...options, include: ['i-am-a'] })
