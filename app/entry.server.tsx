import { renderToPipeableStream } from 'react-dom/server'
import { ServerRouter } from 'react-router'
import { type HandleErrorFunction } from 'react-router'

import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/react-router'

const handleRequest = Sentry.createSentryHandleRequest({
  createReadableStreamFromReadable,
  renderToPipeableStream,
  ServerRouter,
})

export default handleRequest

export const handleError: HandleErrorFunction = (error, { request }) => {
  // React Router may abort some interrupted requests, don't log those
  if (!request.signal.aborted) {
    Sentry.captureException(error)
    // optionally log the error so you can see it
    console.error(error)
  }
}
