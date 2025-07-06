import { reactRouter } from '@react-router/dev/vite'
import { sentryReactRouter } from '@sentry/react-router'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig((config) => {
  const isProd = config.mode === 'production'
  return {
    build: {
      sourcemap: isProd ? false : 'inline',
    },
    plugins: [reactRouter(), sentryReactRouter({ telemetry: false }, config), tsconfigPaths()],
    resolve: {
      alias: {
        '#app': '/app',
      },
    },
    server: {
      port: 3000,
    },
  }
})
