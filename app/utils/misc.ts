import { SITE_DOMAIN, SITE_URL } from '#app/constants/config'

import type { RequestInfo } from '#app/types'

/**
 * Extracts request information for use in loaders and meta functions
 * @param request - The incoming request object
 * @returns Object containing pathname information
 */
export function getRequestInfo(request: Request): RequestInfo {
  return {
    requestInfo: {
      pathname: new URL(request.url).pathname,
    },
  }
}

/**
 * Normalizes a pathname by removing trailing slashes
 * @param pathname - The pathname (e.g., '/about' or '/about/')
 * @returns Normalized pathname without trailing slash (except for root)
 */
export function normalizePathname(pathname: string): string {
  return pathname === '/' ? pathname : pathname.replace(/\/$/, '')
}

/**
 * Normalizes a URL by removing trailing slashes
 * @param baseUrl - The base URL (e.g., 'https://lukemcdonald.com')
 * @param pathname - The pathname (e.g., '/about' or '/about/')
 * @returns Normalized URL without trailing slash (except for root)
 */
export function normalizeUrl(baseUrl: string, pathname: string = '/'): string {
  return `${baseUrl}${pathname}`.replace(/\/$/, '') || baseUrl
}

/**
 * Creates a normalized site URL using the canonical domain
 * @param pathname - The pathname (e.g., '/about' or '/about/')
 * @returns Normalized site URL (e.g., 'https://lukemcdonald.com/about')
 */
export function createSiteUrl(pathname: string = '/'): string {
  return normalizeUrl(SITE_URL, pathname)
}

/**
 * Safely extracts error message from unknown error types
 * @param error - Unknown error object (string, Error instance, or other)
 * @returns Human-readable error message string
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown Error'
}

/**
 * Creates a 404 Not Found response
 * @param data - Optional custom error message
 * @param statusText - Optional custom status text
 * @returns 404 Response object
 */
export function notFound(data?: string, statusText?: string): Response {
  const dataText = data || 'Not Found!'

  return new Response(dataText, { status: 404, statusText })
}

/**
 * Creates a page-specific 404 error with domain context
 * @param path - The path that was not found
 * @returns 404 Response with contextual error message
 */
export function pageNotFound(path?: string) {
  const cleanPath = path?.startsWith('/') ? path : `/${path}`
  return notFound(`"${cleanPath}" is not a page on ${SITE_DOMAIN}.`)
}
