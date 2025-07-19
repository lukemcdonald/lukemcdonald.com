import { getCollection } from 'astro:content'
import { THEME_CONFIG } from '../config'

/**
 * Get all published identity pages
 */
export async function getPublishedIdentityPages() {
  const pages = await getCollection('i-am-a')

  // Filter out drafts if needed
  const filteredPages =
    THEME_CONFIG.display.showDraftIndicator ? pages.filter((page) => !page.data.draft) : pages

  // Sort by title (as configured)
  return filteredPages.sort((a, b) => a.data.title.localeCompare(b.data.title))
}

/**
 * Get main page content
 */
export async function getMainPage() {
  const pages = await getCollection('index')
  return pages[0] // Should only be one main page
}

/**
 * Check if dates should be shown based on config
 */
export function shouldShowDates() {
  return THEME_CONFIG.display.showDates
}

/**
 * Check if last updated should be shown based on config
 */
export function shouldShowLastUpdated() {
  return THEME_CONFIG.display.showLastUpdated
}
