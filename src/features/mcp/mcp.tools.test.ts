import type { McpToolDeps } from './mcp.tools.ts'
import type { PageEntry } from '@/features/pages/pages.types.ts'
import type { ResumeData } from '@/features/resume/resume.types'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'
import { resumeDataSchema } from '@/features/resume/resume.schema.ts'

import { MCP_TOOLS } from './mcp.tools.ts'

const pages = [
  {
    body: '  Home body.  ',
    data: {
      description: 'Frontmatter summary.',
      seo: { description: "I'm Luke, a Christian, husband, father and wrestling coach." },
      title: 'Greetings',
    },
    id: 'index',
  },
  {
    body: '  Talks body.  ',
    data: {
      title: 'TREAD Talks',
    },
    id: 'tread-talks',
  },
] as PageEntry[]

const resume = {
  awards: [{ title: 'Award' }],
  basics: { name: 'Luke McDonald' },
  community: [],
  education: [],
  experience: [],
  personal: ['Family'],
  skills: [{ category: 'Languages', items: ['TypeScript'] }],
} as ResumeData

const deps: McpToolDeps = {
  getPublishedPages: async () => pages,
  getResumeData: async () => resume,
}

function parseToolJson(result: { content: Array<{ text: string }> }) {
  return JSON.parse(result.content[0]?.text ?? 'null') as unknown
}

async function callTool(name: string, args: Record<string, unknown> = {}) {
  const tool = MCP_TOOLS.find((entry) => {
    return entry.name === name
  })

  assert.ok(tool, `missing tool ${name}`)

  return tool.handler(args, deps)
}

describe('get_profile', () => {
  test('returns name, SEO summary, site URL, email, and profiles', async () => {
    const { email, name, profiles, url } = GLOBAL_CONFIG.author

    assert.deepEqual(parseToolJson(await callTool('get_profile')), {
      email,
      name,
      profiles: [...profiles],
      summary: "I'm Luke, a Christian, husband, father and wrestling coach.",
      url,
    })
  })
})

describe('get_resume', () => {
  test('returns the full resume when section is omitted', async () => {
    assert.deepEqual(parseToolJson(await callTool('get_resume')), resume)
  })

  test('returns a named section', async () => {
    assert.deepEqual(
      parseToolJson(await callTool('get_resume', { section: 'basics' })),
      resume.basics,
    )
  })

  test('accepts resumeDataSchema keys and rejects unknown sections', () => {
    const tool = MCP_TOOLS.find((entry) => {
      return entry.name === 'get_resume'
    })

    assert.ok(tool)

    for (const section of resumeDataSchema.keyof().options) {
      assert.equal(tool.inputSchema.safeParse({ section }).success, true)
    }

    assert.equal(tool.inputSchema.safeParse({ section: 'not-a-section' }).success, false)
  })
})

describe('list_pages', () => {
  test('returns id, title, description, and url without body', async () => {
    const listed = parseToolJson(await callTool('list_pages')) as Array<Record<string, unknown>>
    const origin = GLOBAL_CONFIG.site.origin

    assert.deepEqual(listed, [
      {
        description: "I'm Luke, a Christian, husband, father and wrestling coach.",
        id: 'index',
        title: 'Greetings',
        url: `${origin}/`,
      },
      {
        description: '',
        id: 'tread-talks',
        title: 'TREAD Talks',
        url: `${origin}/tread-talks`,
      },
    ])
    assert.equal(
      listed.every((entry) => {
        return !Object.hasOwn(entry, 'body')
      }),
      true,
    )
  })
})

describe('get_page', () => {
  test('returns full page content for a known id', async () => {
    assert.deepEqual(parseToolJson(await callTool('get_page', { slug: 'tread-talks' })), {
      body: 'Talks body.',
      description: '',
      id: 'tread-talks',
      title: 'TREAD Talks',
      url: `${GLOBAL_CONFIG.site.origin}/tread-talks`,
    })
  })

  test('returns an error for an unknown page', async () => {
    const result = await callTool('get_page', { slug: 'missing' })

    assert.equal(result.isError, true)
    assert.equal(result.content[0]?.text, 'Unknown page: missing')
  })
})
