import type { ImageMetadata } from 'astro'

import notFoundImage from '@/assets/images/not-found.jpg'

export interface ErrorData {
  description?: string
  image?: ImageMetadata | string
  imageAlt?: string
  subtitle?: string
  title: string
}

export function createErrorData(status: number): ErrorData {
  const { description, statusText } = ERROR_TYPES[status as keyof typeof ERROR_TYPES]

  return {
    description,
    image: notFoundImage,
    imageAlt: 'Little Carly coding.',
    subtitle: statusText,
    title: status.toString(),
  }
}

const ERROR_TYPES = {
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
