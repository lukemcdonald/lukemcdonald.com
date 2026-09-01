import type { PageFilterOptions } from './pages.types'

import { getCollection } from 'astro:content'

import { buildPagesFilter, sortPages } from './pages.utils'

export async function getPublishedPages(options: PageFilterOptions = {}) {
  const pages = await getCollection('pages', buildPagesFilter(options))

  return sortPages(pages, options)
}
