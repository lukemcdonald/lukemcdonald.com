import React from 'react'
import { redirect } from 'react-router'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router'

import * as Sentry from '@sentry/react-router'

import { Entry } from '#app/components/entry'
import { Layout } from '#app/components/layout'
import { SITE_DOMAIN, FLY_DOMAIN_SUFFIX } from '#app/constants'
import { enhanceMeta } from '#app/utils/meta'
import { getErrorMessage, getRequestInfo } from '#app/utils/misc'

import type { EntryProps, RequestInfo } from '#app/types'
import type { LinksFunction, LoaderFunction, MetaFunction } from 'react-router'

import '../styles/tailwind.css'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const requestInfo = (data as RequestInfo | undefined)?.requestInfo

  return enhanceMeta([], {
    pathname: requestInfo?.pathname,
  })
}

export const links: LinksFunction = () => [
  {
    href: '/favicons/apple-touch-icon.png',
    rel: 'apple-touch-icon',
    sizes: '180x180',
  },
  {
    href: '/favicons/favicon.svg',
    rel: 'icon',
    type: 'image/svg+xml',
  },
  {
    href: '/favicons/favicon.svg',
    rel: 'alternate icon',
    type: 'image/svg+xml',
  },
  {
    color: '#122023',
    href: '/favicons/favicon.svg',
    rel: 'mask-icon',
  },
]

export const loader: LoaderFunction = async ({ request }) => {
  // Force https
  const url = new URL(request.url)
  const hostname = url.hostname
  const proto = request.headers.get('X-Forwarded-Proto') ?? url.protocol

  url.host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host') ?? url.host
  url.protocol = 'https:'

  // Redirect from .fly.dev to custom domain
  if (hostname.includes(FLY_DOMAIN_SUFFIX)) {
    url.hostname = SITE_DOMAIN
    return redirect(url.toString(), {
      headers: {
        'X-Forwarded-Proto': 'https',
      },
      status: 301, // Permanent redirect for SEO
    })
  }

  if (proto === 'http' && hostname !== 'localhost') {
    return redirect(url.toString(), {
      headers: {
        'X-Forwarded-Proto': 'https',
      },
    })
  }

  if (url.host.includes('www.')) {
    return redirect(url.toString().replace('www.', ''), {
      headers: {
        'X-Forwarded-Proto': 'https',
      },
    })
  }

  return {
    ...getRequestInfo(request),
  }
}

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width,initial-scale=1"
          name="viewport"
        />
        {title ?
          <title>{title}</title>
        : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  )
}

export default App

export function ErrorBoundary() {
  const error = useRouteError()

  const entryData: EntryProps = {
    description: `Unknown error.`,
    html: '',
    image:
      'https://res.cloudinary.com/lukemcdonald/image/upload/v1642448418/lukemcdonald-com/not-found_y5jbrf.jpg',
    imageAlt: 'Little Carly coding.',
    title: 'Error',
  }

  function buildErrorHtml(errorMessage: string) {
    if (!errorMessage) {
      return ''
    }

    return `<pre class="text-base leading-7 whitespace-normal"><span class="px-1 py-px font-sans text-sm font-medium uppercase rounded-sm text-primary-900 bg-primary-500">Error</span> <span class="block mt-2">${errorMessage}</span></pre>`
  }

  if (isRouteErrorResponse(error)) {
    const entryErrorData = {
      ...entryData,
      html: buildErrorHtml(error.data),
      subtitle: error.statusText,
      title: error.status.toString(),
    }

    switch (error.status) {
      case 401:
        entryErrorData.description = `Oops! Looks like you tried to visit a page that you do not have access to.`
        break
      case 404:
        entryErrorData.description = `Oops! Looks like you tried to visit a page that does not exist.`
        break
      default:
        throw new Error(error.data || error.statusText)
    }

    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <Layout>
          <Entry data={entryErrorData} />
        </Layout>
      </Document>
    )
  }

  if (error instanceof Error) {
    // Capture the error with Sentry
    Sentry.captureException(error)

    const entryErrorData = {
      ...entryData,
      description:
        'There was an uncaught exception in your application. Check the browser or server console to inspect the error.',
      html: buildErrorHtml(getErrorMessage(error)),
      title: 'Error',
    }

    return (
      <Document title={entryErrorData.title}>
        <Layout>
          <Entry data={entryErrorData} />
        </Layout>
      </Document>
    )
  }

  // Capture any other unknown errors
  Sentry.captureException(error)

  return (
    <Document title={entryData.title}>
      <Layout>
        <Entry data={entryData} />
      </Layout>
    </Document>
  )
}
