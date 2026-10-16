import type { McpPageEntry } from './mcp.tools.ts'
import type { ResumeData } from '@/features/resume/resume.types'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { FALLBACK_VERSE } from '@/features/verse/verse.constants'

import {
  getContactResult,
  getPageResult,
  getResumeResult,
  getVerseResult,
  listPagesResult,
  loadVerseOrFallback,
  RESUME_SECTIONS,
} from './mcp.tools.ts'

const ORIGIN = 'https://lukemcdonald.com'

const contact = {
  email: 'luke@example.com',
  name: 'Luke McDonald',
  profiles: [
    { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
  ],
  url: ORIGIN,
}

const pages: McpPageEntry[] = [
  {
    body: '  Home body.  ',
    data: {
      description: 'Hello from home.',
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

function parseToolJson(result: { content: Array<{ text: string }> }) {
  return JSON.parse(result.content[0]?.text ?? 'null') as unknown
}

describe('getResumeResult', () => {
  test('returns the full resume when section is omitted', () => {
    assert.deepEqual(parseToolJson(getResumeResult(resume)), resume)
  })

  test('returns a named section', () => {
    assert.deepEqual(parseToolJson(getResumeResult(resume, 'basics')), resume.basics)
  })

  test('returns an error for an unknown section', () => {
    const result = getResumeResult(resume, 'talks')

    assert.equal(result.isError, true)
    assert.match(result.content[0]?.text ?? '', /Unknown resume section: talks/)
    assert.match(result.content[0]?.text ?? '', new RegExp(RESUME_SECTIONS.join(', ')))
  })
})

describe('listPagesResult', () => {
  test('returns title, description, url, and body text for each page', () => {
    assert.deepEqual(parseToolJson(listPagesResult(pages, ORIGIN)), [
      {
        body: 'Home body.',
        description: 'Hello from home.',
        id: 'index',
        title: 'Greetings',
        url: `${ORIGIN}/`,
      },
      {
        body: 'Talks body.',
        description: '',
        id: 'tread-talks',
        title: 'TREAD Talks',
        url: `${ORIGIN}/tread-talks`,
      },
      {
        body: 'Faith body.',
        description: '',
        id: 'i-am-a/christian',
        title: 'Christian',
        url: `${ORIGIN}/i-am-a/christian`,
      },
    ])
  })
})

describe('getPageResult', () => {
  test('returns one published page by slug, path, or URL', () => {
    const expected = {
      body: 'Talks body.',
      description: '',
      id: 'tread-talks',
      title: 'TREAD Talks',
      url: `${ORIGIN}/tread-talks`,
    }

    assert.deepEqual(parseToolJson(getPageResult(pages, 'tread-talks', ORIGIN)), expected)
    assert.deepEqual(parseToolJson(getPageResult(pages, '/tread-talks', ORIGIN)), expected)
    assert.deepEqual(parseToolJson(getPageResult(pages, `${ORIGIN}/tread-talks`, ORIGIN)), expected)
    assert.deepEqual(parseToolJson(getPageResult(pages, '/i-am-a/christian/', ORIGIN)), {
      body: 'Faith body.',
      description: '',
      id: 'i-am-a/christian',
      title: 'Christian',
      url: `${ORIGIN}/i-am-a/christian`,
    })
  })

  test('returns the home page for / and index', () => {
    const result = parseToolJson(getPageResult(pages, '/', ORIGIN)) as { id: string }

    assert.equal(result.id, 'index')
  })

  test('returns an error for an unknown page', () => {
    const result = getPageResult(pages, 'missing', ORIGIN)

    assert.equal(result.isError, true)
    assert.equal(result.content[0]?.text, 'Unknown page: missing')
  })
})

describe('getContactResult', () => {
  test('returns name, email, url, and profiles', () => {
    assert.deepEqual(parseToolJson(getContactResult(contact)), {
      email: contact.email,
      name: contact.name,
      profiles: [...contact.profiles],
      url: contact.url,
    })
  })
})

describe('getVerseResult', () => {
  test('returns the verse payload', () => {
    assert.deepEqual(parseToolJson(getVerseResult(FALLBACK_VERSE)), FALLBACK_VERSE)
  })
})

describe('loadVerseOrFallback', () => {
  test('returns the loaded verse', async () => {
    assert.equal(await loadVerseOrFallback(async () => FALLBACK_VERSE), FALLBACK_VERSE)
  })

  test('returns the fallback verse when loading fails', async () => {
    assert.equal(
      await loadVerseOrFallback(async () => {
        throw new Error('network')
      }),
      FALLBACK_VERSE,
    )
  })
})
