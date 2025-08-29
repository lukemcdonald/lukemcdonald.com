import type { Props as EntryProps } from '@/components/Entry/Entry.astro'

import notFoundImage from '@/assets/images/not-found.jpg'

export interface ErrorData extends EntryProps {
  html?: string
}

export function createErrorData(status: number, errorMessage?: string): ErrorData {
  const { description, statusText } = ERROR_TYPES[status as keyof typeof ERROR_TYPES]
  const baseData: ErrorData = {
    description,
    image: notFoundImage,
    imageAlt: 'Little Carly coding.',
    subtitle: statusText,
    title: status.toString(),
  }

  if (errorMessage) {
    baseData.html = `<pre class="text-base leading-7 whitespace-normal"><span class="px-1 py-px font-sans text-sm font-medium uppercase rounded-xs text-primary-900 bg-primary-500">Error</span> <span class="block mt-2">${errorMessage}</span></pre>`
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
