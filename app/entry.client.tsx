import { useEffect } from 'react'
import { init, replayIntegration, browserTracingIntegration } from '@sentry/remix'
import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import { hydrateRoot } from 'react-dom/client'

init({
  dsn: 'https://e1570a664722c4f007649ad14461ef4a@o4509604435722240.ingest.us.sentry.io/4509604435984392',
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

  integrations: [
    browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
    replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1,
})

hydrateRoot(document, <RemixBrowser />)
