import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

import * as Sentry from '@sentry/react-router'

const IS_PROD = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: 'https://e1570a664722c4f007649ad14461ef4a@o4509604435722240.ingest.us.sentry.io/4509604435984392',
  environment: process.env.NODE_ENV,
  tracesSampleRate: IS_PROD ? 0.1 : 1,

  integrations: [
    Sentry.reactRouterTracingIntegration(),
    Sentry.replayIntegration({
      blockAllMedia: true,
      maskAllText: true,
    }),
  ],

  replaysOnErrorSampleRate: 1,
  replaysSessionSampleRate: IS_PROD ? 0.1 : 0.5,
})

hydrateRoot(
  document,
  <StrictMode>
    <HydratedRouter />
  </StrictMode>,
)
