import * as Sentry from '@sentry/react-router'

const IS_PROD = process.env.NODE_ENV === 'production'

Sentry.init({
  dsn: 'https://e1570a664722c4f007649ad14461ef4a@o4509604435722240.ingest.us.sentry.io/4509604435984392',
  environment: process.env.NODE_ENV,

  // Adds request headers and IP for users
  sendDefaultPii: true,

  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },

  integrations: [
    // Profiling integration disabled due to library compatibility issues in Fly.io
    // nodeProfilingIntegration(),
  ],

  tracesSampleRate: IS_PROD ? 0.1 : 1.0,

  // Profiling sample rate commented out since profiling is disabled
  // profilesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
})
