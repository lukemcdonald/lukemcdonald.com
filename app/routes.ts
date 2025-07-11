import { type RouteConfig, route, index } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),
  route(':content/:slug', './routes/$content.$slug.tsx'),
  route('dev/error', './routes/dev.error.tsx'),
  route('resume', './routes/resume.ts'),
  route('sitemap.xml', './routes/sitemap[.]xml.tsx'),
] satisfies RouteConfig
