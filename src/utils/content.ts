import { getCollection } from 'astro:content'

/**
 * Get all published identity pages
 */
export async function getPublishedIdentityPages() {
  const pages = await getCollection('i-am-a')
  const filteredPages = pages.filter((page) => !page.data.draft)
  return filteredPages.sort((a, b) => a.data.title.localeCompare(b.data.title))
}

/**
 * Get main page content
 */
export async function getMainPage() {
  const pages = await getCollection('index')
  return pages[0] // Should only be one main page
}
