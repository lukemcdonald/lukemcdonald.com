import type { CollectionEntry } from 'astro:content'

export type PageEntry = CollectionEntry<'pages'>

export interface PageFilterOptions {
  include?: string[]
  sortBy?: 'order' | 'title'
}
