export interface ErrorData {
  description: string
  html?: string
  image: string
  imageAlt: string
  subtitle: string
  title: string
}

export function buildErrorHtml(errorMessage: string): string {
  if (!errorMessage) {
    return ''
  }

  return `<pre class="text-base leading-7 whitespace-normal"><span class="px-1 py-px font-sans text-sm font-medium uppercase rounded-xs text-primary-900 bg-primary-500">Error</span> <span class="block mt-2">${errorMessage}</span></pre>`
}

export function getErrorMessage(error: Error): string {
  return error.message || 'An unknown error occurred'
}

export function createErrorData(status: number, errorMessage?: string): ErrorData {
  const { description, statusText } = ERROR_TYPES[status as keyof typeof ERROR_TYPES]
  const baseData: ErrorData = {
    description,
    image:
      'https://res.cloudinary.com/lukemcdonald/image/upload/v1642448418/lukemcdonald-com/not-found_y5jbrf.jpg',
    imageAlt: 'Little Carly coding.',
    subtitle: statusText,
    title: status.toString(),
  }

  if (errorMessage) {
    baseData.html = buildErrorHtml(errorMessage)
  }

  return baseData
}

export const ERROR_TYPES = {
  401: {
    description: 'Oops! Looks like you tried to visit a page that you do not have access to.',
    statusText: 'Unauthorized',
  },
  404: {
    description: 'Oops! Looks like you tried to visit a page that does not exist.',
    statusText: 'Not Found',
  },
  500: {
    description:
      'There was an uncaught exception in your application. Check the browser or server console to inspect the error.',
    statusText: 'Internal Server Error',
  },
} as const

// Utility function to redirect to error pages
export function redirectToError(status: number, message?: string): Response {
  const url = new URL('/error', 'http://localhost')
  url.searchParams.set('status', status.toString())
  if (message) {
    url.searchParams.set('message', message)
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.pathname + url.search,
    },
  })
}

// Utility function to check if an error is a route error response
export function isRouteErrorResponse(
  error: unknown,
): error is { status: number; statusText: string; data?: string } {
  return typeof error === 'object' && error !== null && 'status' in error && 'statusText' in error
}
