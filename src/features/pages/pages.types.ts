import type { CollectionEntry } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>

export type SortBy = 'title' | 'order' | 'date' | 'custom' | 'manual'

export interface PageFilterOptions {
  allowDrafts?: boolean
  customFilter?: (entry: PageEntry) => boolean
  customSort?: (a: PageEntry, b: PageEntry) => number
  exclude?: string[]
  include?: string[]
  manualOrder?: string[]
  sortBy?: SortBy
  // Optional date filtering based on `data.pubDate`
  dateFrom?: Date | string | number
  dateTo?: Date | string | number
  hideFuture?: boolean
  hidePast?: boolean
}

export interface PageSortOptions {
  customSort?: (a: PageEntry, b: PageEntry) => number
  manualOrder?: string[]
  sortBy?: SortBy
}
