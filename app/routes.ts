import { type RouteConfig, route, index } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),
  route('resume', './routes/resume.ts'),
  route(':content/:slug', './routes/$content.$slug.tsx'),
  route('dev/error', './routes/dev.error.tsx'),
] satisfies RouteConfig
