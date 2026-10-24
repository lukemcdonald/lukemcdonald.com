import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const PAGES_DIR = 'src/content/pages'
const RESUME_BASICS = 'src/content/resume/basics.yaml'

type SitemapItem = {
  lastmod?: string
  url: string
}

export function applySitemapLastmod<T extends SitemapItem>(item: T): T & { lastmod?: string } {
  const lastmod = getSitemapLastmod(toSitemapPathname(item.url))

  if (!lastmod) {
    return item
  }

  return {
    ...item,
    lastmod,
  }
}

export function getFrontmatterLastmod(source: string) {
  const block = source.startsWith('---') ? (source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '') : source
  const updated = block.match(/^updated:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m)?.[1]

  if (updated) {
    return updated
  }

  return block.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/m)?.[1]
}

export function getSitemapLastmod(pathname: string) {
  const dates = resolveSitemapSourcePaths(pathname).flatMap((path) => {
    if (!existsSync(path)) {
      return []
    }

    const lastmod = getFrontmatterLastmod(readFileSync(path, 'utf8'))

    return lastmod ? [lastmod] : []
  })

  if (dates.length === 0) {
    return
  }

  return dates.sort()[dates.length - 1]
}

export function resolveSitemapSourcePaths(pathname: string) {
  if (pathname === '/resume') {
    return [RESUME_BASICS]
  }

  if (pathname === '/') {
    return [join(PAGES_DIR, 'index.md')]
  }

  if (!pathname.startsWith('/')) {
    return []
  }

  return [join(PAGES_DIR, `${pathname.slice(1)}.md`)]
}

export function toSitemapPathname(url: string) {
  const pathname = new URL(url).pathname

  if (pathname === '/') {
    return '/'
  }

  return pathname.replace(/\/$/, '')
}
