import type { AstroIntegration } from 'astro'

import { appendFile, readFile } from 'node:fs/promises'

const HTML_REDIRECT_STATUS = '301!'
const SKIP_PATHS = new Set(['/404', '/500'])
const SKIP_PREFIXES = ['/api/', '/dev/']

type PageRoute = {
  pathname: string
}

function getRedirectFrom(line: string) {
  const trimmed = line.trim()

  if (!trimmed || trimmed.startsWith('#')) {
    return
  }

  return trimmed.split(/\s+/)[0]
}

function getRedirectFroms(redirects: string) {
  const froms = new Set<string>()

  for (const line of redirects.split('\n')) {
    const from = getRedirectFrom(line)

    if (from) {
      froms.add(from)
    }
  }

  return froms
}

function toCleanPath(pathname: string) {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '')

  if (trimmed === '' || trimmed === 'index') {
    return '/'
  }

  return `/${trimmed}`
}

function toHtmlRedirectFrom(cleanPath: string) {
  if (cleanPath === '/') {
    return '/index.html'
  }

  return `${cleanPath}.html`
}

function toHtmlRedirectRule(cleanPath: string) {
  return `${toHtmlRedirectFrom(cleanPath)}  ${cleanPath}  ${HTML_REDIRECT_STATUS}`
}

function isHtmlRedirectPage(pathname: string) {
  const path = toCleanPath(pathname)

  if (SKIP_PATHS.has(path)) {
    return false
  }

  return !SKIP_PREFIXES.some((prefix) => {
    return path.startsWith(prefix)
  })
}

export function buildHtmlRedirectRules(pages: PageRoute[], existingRedirects = '') {
  const existingFroms = getRedirectFroms(existingRedirects)
  const rules = new Map<string, string>()

  for (const page of pages) {
    if (!isHtmlRedirectPage(page.pathname)) {
      continue
    }

    const cleanPath = toCleanPath(page.pathname)
    const from = toHtmlRedirectFrom(cleanPath)

    if (existingFroms.has(from) || rules.has(from)) {
      continue
    }

    rules.set(from, toHtmlRedirectRule(cleanPath))
  }

  return [...rules.values()]
    .sort((left, right) => {
      return left.localeCompare(right)
    })
    .join('\n')
}

export function createHtmlRedirectsIntegration(): AstroIntegration {
  return {
    hooks: {
      'astro:build:done': async ({ dir, logger, pages }) => {
        const redirectsUrl = new URL('_redirects', dir)
        const existing = await readFile(redirectsUrl, 'utf8').catch(() => {
          return ''
        })
        const generated = buildHtmlRedirectRules(pages, existing)

        if (!generated) {
          return
        }

        const prefix = existing && !existing.endsWith('\n') ? '\n' : ''

        await appendFile(redirectsUrl, `${prefix}\n# Generated .html to clean URLs\n${generated}\n`)
        logger.info(`Added ${generated.split('\n').length} .html redirects`)
      },
    },
    name: 'html-redirects',
  }
}
