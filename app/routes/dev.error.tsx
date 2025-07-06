import * as Sentry from '@sentry/react-router'

import type { LoaderFunction } from 'react-router'

const buttonClasses =
  'bg-error-600 cursor-pointer rounded-md border-none px-3 py-2 text-base text-white'

export const loader: LoaderFunction = async () => {
  if (!process.env.ENABLE_DEV_ROUTES) {
    throw new Response('Not Found', { status: 404 })
  }
  return null
}

export const meta = () => {
  return [
    { title: 'Error Testing - Dev Only' },
    { content: 'noindex, nofollow, noarchive, nosnippet', name: 'robots' },
    { content: 'noindex, nofollow, noarchive, nosnippet', name: 'googlebot' },
  ]
}

export default function DevErrorPage() {
  // Example 1: Simple error with performance trace (from official docs)
  const handleErrorWithTrace = () => {
    Sentry.startSpan({ name: 'Example Frontend Span', op: 'test' }, () => {
      setTimeout(() => {
        throw new Error('Sentry Test Error - Frontend Exception')
      }, 99)
    })
  }

  // Example 2: Manually captured exception with context
  const handleManualException = () => {
    try {
      // Add some context
      Sentry.setTag('test-type', 'manual-capture')
      Sentry.setContext('test-info', {
        testName: 'Manual Exception Test',
        timestamp: new Date().toISOString(),
      })

      // Simulate an error
      throw new Error('Manually captured test error')
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  // Example 3: Custom message with extra data
  const handleCustomMessage = () => {
    Sentry.addBreadcrumb({
      category: 'user-interaction',
      level: 'info',
      message: 'User clicked custom message test',
    })

    Sentry.captureMessage('Custom test message from React Router v7', {
      extra: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      level: 'warning',
      tags: {
        action: 'custom-message',
        component: 'dev-error',
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1>Error Testing Page</h1>

      <div className="flex flex-col gap-4">
        <div>
          <p>Creates a performance span and throws an error</p>
          <button
            className={buttonClasses}
            onClick={handleErrorWithTrace}
          >
            Test Error with Performance Trace
          </button>
        </div>

        <div>
          <p>Demonstrates manual error capture with context</p>
          <button
            className={buttonClasses}
            onClick={handleManualException}
          >
            Test Manual Exception Capture
          </button>
        </div>

        <div>
          <p>Sends a custom message with breadcrumbs and metadata</p>
          <button
            className={buttonClasses}
            onClick={handleCustomMessage}
          >
            Test Custom Message with Context
          </button>
        </div>
      </div>
    </div>
  )
}
