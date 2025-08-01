import { getCollection, type CollectionEntry } from 'astro:content'
import { getContentDirectory } from '../collections'

export interface PageFilterOptions {
  /** Whether to include draft pages (default: false) */
  allowDrafts?: boolean
  /** Custom filter function for advanced filtering */
  customFilter?: (entry: CollectionEntry<'pages'>) => boolean
  /** Exclude specific page IDs */
  exclude?: string[]
  /** Include pages from these directories or specific page IDs */
  include?: string[]
}

/**
 * Get pages with flexible filtering options
 */
export async function getPublishedPages(options: PageFilterOptions = {}) {
  const { allowDrafts = false, customFilter, exclude = [], include } = options

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

  return pages.sort((a, b) => a.data.title.localeCompare(b.data.title))
}

export const getIdentityPages = (options: PageFilterOptions = {}) =>
  getPublishedPages({ ...options, include: ['i-am-a'] })
