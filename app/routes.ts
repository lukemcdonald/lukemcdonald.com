import { type RouteConfig, route, index } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),
  route('resume', './routes/resume.ts'),
  route(':content/:slug', './routes/$content.$slug.tsx'),
  route('dev/sentry-test', './routes/dev.sentry-test.tsx'),
] satisfies RouteConfig
