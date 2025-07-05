import { pageNotFound } from '#app/utils/misc'
import parseFrontMatter from 'front-matter'
import fs from 'fs/promises'
import { marked } from 'marked'
import path, { dirname } from 'path'
import invariant from 'tiny-invariant'
import { fileURLToPath } from 'url'

import type { Content } from '#app/types'

type ContentMarkdownAttributes = Omit<Content, 'html' | 'markdown'>

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const contentPath = path.join(__dirname, '..', '..', 'content')

// Simple in-memory cache to prevent repeated file reads and markdown processing
const contentCache = new Map<string, Content>()

function isValidContentAttributes(attributes: any): attributes is ContentMarkdownAttributes {
  const required = ['draft', 'image', 'description', 'title']
  return required.every((key) => Object.keys(attributes).includes(key))
}

export async function contentExists({
  contentDir = '',
  slug = '',
}: {
  contentDir?: string
  slug: string
}): Promise<boolean> {
  const filename = [contentDir, slug].filter(Boolean).join('/')
  const filepath = path.join(contentPath, `${filename}.md`)

  try {
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}

export async function getContent({
  contentDir = '',
  slug = '',
}: {
  contentDir?: string
  slug: string
}) {
  const filename = [contentDir, slug].filter(Boolean).join('/')

  // Check cache first
  if (contentCache.has(filename)) {
    return contentCache.get(filename)
  }

  const filepath = path.join(contentPath, `${filename}.md`)

  try {
    const file = await fs.readFile(filepath)
    const { attributes, body } = parseFrontMatter(file.toString())

    invariant(isValidContentAttributes(attributes), `Content ${filepath} is missing attributes.`)

    const html = await marked(body)

    const content = {
      ...attributes,
      filename,
      html,
      markdown: body,
    }

    // Cache the processed content
    contentCache.set(filename, content)

    return content
  } catch (error) {
    console.error(error)
    throw pageNotFound(filename)
  }
}
