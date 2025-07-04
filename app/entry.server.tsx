import * as Sentry from '@sentry/react-router'
import { createReadableStreamFromReadable } from '@react-router/node'
import { renderToPipeableStream } from 'react-dom/server'
import { ServerRouter } from 'react-router'
import { type HandleErrorFunction } from 'react-router'

const handleRequest = Sentry.createSentryHandleRequest({
  ServerRouter,
  renderToPipeableStream,
  createReadableStreamFromReadable,
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
