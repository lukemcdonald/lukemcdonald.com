import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { createLlmsTxt } from './llms-txt.ts'

const ORIGIN = 'https://lukemcdonald.com'

function page(
  id: string,
  title: string,
  extra: { description?: string; seoDescription?: string } = {},
) {
  return {
    data: {
      description: extra.description,
      seo: extra.seoDescription ? { description: extra.seoDescription } : undefined,
      title,
    },
    id,
  }
}

describe('createLlmsTxt', () => {
  test('builds llmstxt.org markdown with absolute urls', () => {
    const markdown = createLlmsTxt({
      name: 'Luke McDonald',
      origin: ORIGIN,
      pages: [
        page('index', 'Greetings', {
          seoDescription: "I'm Luke, a Christian, husband, father and wrestling coach.",
        }),
        page('i-am-a/christian', 'Christian', {
          description: 'A <em>faith</em> page.',
        }),
        page('tread-talks', 'TREAD Talks'),
      ],
      resume: {
        awards: [],
        basics: {
          label: 'Full-Stack Engineer',
        },
        skills: [],
      },
    })

    assert.equal(
      markdown,
      [
        '# Luke McDonald',
        '',
        "> I'm Luke, a Christian, husband, father and wrestling coach.",
        '',
        '## Pages',
        '',
        `- [Home](${ORIGIN}/)`,
        `- [Resume](${ORIGIN}/resume): Full-Stack Engineer`,
        `- [Christian](${ORIGIN}/i-am-a/christian): A faith page.`,
        `- [TREAD Talks](${ORIGIN}/tread-talks)`,
        '',
        '## Resume',
        '',
        `- [Full resume](${ORIGIN}/api/resume.json)`,
        `- [Awards](${ORIGIN}/api/resume/awards.json)`,
        `- [Basics](${ORIGIN}/api/resume/basics.json)`,
        `- [Skills](${ORIGIN}/api/resume/skills.json)`,
        '',
        '## Contact',
        '',
        `- [Email](mailto:${GLOBAL_CONFIG.author.email})`,
        ...GLOBAL_CONFIG.author.profiles.map((profile) => {
          return `- [${profile.network}](${profile.url})`
        }),
        '',
        '## MCP',
        '',
        `- [Site MCP server](${ORIGIN}/mcp): Read-only tools for resume, pages, contact, and verse of the day`,
        '',
      ].join('\n'),
    )
  })

  test('falls back to the resume intro when the home page has no summary', () => {
    const markdown = createLlmsTxt({
      name: 'Luke McDonald',
      origin: ORIGIN,
      pages: [page('tread-talks', 'TREAD Talks')],
      resume: {
        basics: {
          intro: 'Hands-on engineer building products.',
        },
      },
    })

    assert.match(markdown, /^# Luke McDonald\n\n> Hands-on engineer building products\.\n/)
    assert.match(
      markdown,
      /## Resume\n\n- \[Full resume\]\(https:\/\/lukemcdonald\.com\/api\/resume\.json\)/,
    )
  })
})
