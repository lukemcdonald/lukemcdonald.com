import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { toPagePath } from '../src/utils/content'

const PAGES_DIR = join(process.cwd(), 'src/content/pages')

const STANDALONE_ROUTES = [
  { id: 'not-found', path: '/missing-page' },
  { id: 'resume', path: '/resume' },
] as const

export const THEMES = ['dark', 'light'] as const

export type SiteTheme = (typeof THEMES)[number]

export type SiteRoute = {
  id: string
  path: string
}

function isDraftPage(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)

  return Boolean(match?.[1] && /^draft:\s*true\s*$/m.test(match[1]))
}

function toContentRoute(relativePath: string) {
  const id = relativePath.replace(/\.mdx?$/, '')

  return {
    id: id === 'index' ? 'home' : id,
    path: toPagePath(id),
  }
}

function loadContentRoutes(): SiteRoute[] {
  return globSync('**/[^_]*.{md,mdx}', { cwd: PAGES_DIR })
    .filter((relativePath) => {
      return !isDraftPage(readFileSync(join(PAGES_DIR, relativePath), 'utf8'))
    })
    .map(toContentRoute)
}

function compareRoutes(a: SiteRoute, b: SiteRoute) {
  return a.path.localeCompare(b.path)
}

export const ROUTES: SiteRoute[] = [...loadContentRoutes(), ...STANDALONE_ROUTES].sort(
  compareRoutes,
)
