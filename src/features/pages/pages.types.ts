import type { CollectionEntry } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>

export type SortBy = 'title' | 'order' | 'pubDate' | 'custom' | 'manual'

export interface PageFilterOptions {
  allowDrafts?: boolean
  customFilter?: (entry: PageEntry) => boolean
  customSort?: (a: PageEntry, b: PageEntry) => number
  exclude?: string[]
  include?: string[]
  manualOrder?: string[]
  sortBy?: SortBy
}

export interface PageSortOptions {
  sortBy?: SortBy
  customSort?: (a: PageEntry, b: PageEntry) => number
  manualOrder?: string[]
}
