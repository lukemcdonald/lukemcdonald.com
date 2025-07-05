import * as Sentry from '@sentry/react-router'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Adds request headers and IP for users
  sendDefaultPii: true,

  // Enable logs to be sent to Sentry
  _experiments: { enableLogs: true },

  integrations: [
    // Profiling integration disabled due to library compatibility issues in Fly.io
    // nodeProfilingIntegration(),
  ],

  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),

  // Profiling sample rate commented out since profiling is disabled
  // profilesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
})
