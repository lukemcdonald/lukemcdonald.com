import type { McpPageEntry, McpToolDeps } from './mcp.tools.ts'
import type { ResumeData } from '@/features/resume/resume.types'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { MCP_TOOLS } from './mcp.tools.ts'

const ORIGIN = 'https://lukemcdonald.com'

const pages: McpPageEntry[] = [
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
    body: 'Talks body.',
    data: {
      title: 'TREAD Talks',
    },
    id: 'tread-talks',
  },
  {
    body: 'Faith body.',
    data: {
      title: 'Christian',
    },
    id: 'i-am-a/christian',
  },
]

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
  author: {
    email: 'luke@example.com',
    name: 'Luke McDonald',
    profiles: [
      { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
    ],
    url: ORIGIN,
  },
  getPublishedPages: async () => pages,
  getResumeData: async () => resume,
  origin: ORIGIN,
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
    assert.deepEqual(parseToolJson(await callTool('get_profile')), {
      email: 'luke@example.com',
      name: 'Luke McDonald',
      profiles: [
        { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
      ],
      summary: "I'm Luke, a Christian, husband, father and wrestling coach.",
      url: ORIGIN,
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
})

describe('list_pages', () => {
  test('returns id, title, description, and url without body', async () => {
    const listed = parseToolJson(await callTool('list_pages')) as Array<Record<string, unknown>>

    assert.deepEqual(listed, [
      {
        description: "I'm Luke, a Christian, husband, father and wrestling coach.",
        id: 'index',
        title: 'Greetings',
        url: `${ORIGIN}/`,
      },
      {
        description: '',
        id: 'tread-talks',
        title: 'TREAD Talks',
        url: `${ORIGIN}/tread-talks`,
      },
      {
        description: '',
        id: 'i-am-a/christian',
        title: 'Christian',
        url: `${ORIGIN}/i-am-a/christian`,
      },
    ])
    assert.equal(
      listed.every((page) => {
        return !Object.hasOwn(page, 'body')
      }),
      true,
    )
  })
})

describe('get_page', () => {
  test('returns one published page by slug, path, or URL', async () => {
    const expected = {
      body: 'Talks body.',
      description: '',
      id: 'tread-talks',
      title: 'TREAD Talks',
      url: `${ORIGIN}/tread-talks`,
    }

    assert.deepEqual(parseToolJson(await callTool('get_page', { slug: 'tread-talks' })), expected)
    assert.deepEqual(parseToolJson(await callTool('get_page', { slug: '/tread-talks' })), expected)
    assert.deepEqual(
      parseToolJson(await callTool('get_page', { slug: `${ORIGIN}/tread-talks` })),
      expected,
    )
    assert.deepEqual(parseToolJson(await callTool('get_page', { slug: '/i-am-a/christian/' })), {
      body: 'Faith body.',
      description: '',
      id: 'i-am-a/christian',
      title: 'Christian',
      url: `${ORIGIN}/i-am-a/christian`,
    })
  })

  test('returns the home page for /', async () => {
    const result = parseToolJson(await callTool('get_page', { slug: '/' })) as { id: string }

    assert.equal(result.id, 'index')
  })

  test('returns an error for an unknown page', async () => {
    const result = await callTool('get_page', { slug: 'missing' })

    assert.equal(result.isError, true)
    assert.equal(result.content[0]?.text, 'Unknown page: missing')
  })
})
