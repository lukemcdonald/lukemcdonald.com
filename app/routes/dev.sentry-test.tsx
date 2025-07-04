import * as Sentry from '@sentry/react-router'
import { useState, useEffect } from 'react'
import type { LoaderFunction } from 'react-router'

class SentryTestError extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'SentryTestError'
  }
}

export const loader: LoaderFunction = async () => {
  if (!process.env.ENABLE_DEV_ROUTES) {
    throw new Response('Not Found', { status: 404 })
  }
  return null
}

export const meta = () => {
  return [
    { title: 'sentry-test-dev-page' },
    { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
    { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },
  ]
}

export default function SentryExamplePage() {
  const [hasSentError, setHasSentError] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  const handleThrowError = async () => {
    await Sentry.startSpan({ name: 'Example Frontend Span', op: 'test' }, async () => {
      try {
        const res = await fetch('/api/sentry-example-api')
        if (!res.ok) {
          // Log the API failure but don't set hasSentError here
          console.warn('API endpoint returned non-OK status:', res.status)
        }
      } catch (error) {
        // Handle fetch error gracefully
        console.warn('API endpoint not available:', error)
      }
    })

    // The actual Sentry error that gets sent - set state after throwing
    setHasSentError(true)
    throw new SentryTestError('Test error for Sentry integration')
  }

  return (
    <div>
      <main
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
        }}
      >
        <h1>Sentry Test</h1>

        <p className="description">
          <strong>Dev/Test Only:</strong> Click the button below, and view the sample error on the
          Sentry.
        </p>

        <button className="button" type="button" onClick={handleThrowError} disabled={!isConnected}>
          Throw Sample Error
        </button>

        {hasSentError ? (
          <p className="success">Sample error was sent to Sentry.</p>
        ) : !isConnected ? (
          <div className="connectivity-error">
            <p>
              It looks like network requests to Sentry are being blocked, which will prevent errors
              from being captured. Try disabling your ad-blocker to complete the test.
            </p>
          </div>
        ) : (
          <div className="success_placeholder" />
        )}

        <div className="flex-spacer" />
      </main>
    </div>
  )
}
