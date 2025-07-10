import { href } from 'react-router'

import { generateRemixSitemap } from '@forge42/seo-tools/remix/sitemap'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

import type { Route } from './+types/sitemap[.]xml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const contentPath = path.join(__dirname, '..', '..', 'content')

// Simple content discovery - just find .md files and convert to URLs
async function getContentPaths(): Promise<string[]> {
  const paths: string[] = []

  async function scanDirectory(dir: string, prefix: string = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const urlPath = prefix ? `${prefix}/${entry.name}` : entry.name

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, urlPath)
        } else if (entry.name.endsWith('.md')) {
          const slug = entry.name.replace('.md', '')
          paths.push(prefix ? `${prefix}/${slug}` : slug)
        }
      }
    } catch (error) {
      console.error('Error scanning content:', error)
    }
  }

  await scanDirectory(contentPath)
  return paths
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { routes } = await import('virtual:react-router/server-build')
  const { origin } = new URL(request.url)

  // Get base sitemap from routes
  const sitemap = await generateRemixSitemap({
    domain: origin,
    ignore: [href('/dev/error')],
    routes,
  })

  // Get content paths and add them to sitemap
  const contentPaths = await getContentPaths()
  const contentEntries = contentPaths
    .map((path) => `<url><loc>${origin}/${path}</loc></url>`)
    .join('')

  // Filter out dynamic route templates and add content
  const cleanSitemap = sitemap
    .replace(/<url><loc>[^<]*\/:[^<]*<\/loc><\/url>/g, '')
    .replace('</urlset>', `${contentEntries}</urlset>`)

  return new Response(cleanSitemap, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
