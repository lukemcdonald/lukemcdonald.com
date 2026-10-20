import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import { buildResumeData, pickResumeSection } from './resume.utils.ts'

type ResumeStub = Parameters<typeof buildResumeData>[0][number]

function entry(id: string, data: unknown): ResumeStub {
  return {
    data,
    id,
  } as ResumeStub
}

describe('buildResumeData', () => {
  test('assigns top-level files and fills contact from site config', () => {
    const data = buildResumeData([
      entry('basics.yaml', { email: 'other@example.com', intro: 'Hi', name: 'Other' }),
    ])

    assert.equal(data.basics.email, GLOBAL_CONFIG.author.email)
    assert.equal(data.basics.intro, 'Hi')
    assert.equal(data.basics.name, GLOBAL_CONFIG.author.name)
    assert.deepEqual(data.basics.profiles, [...GLOBAL_CONFIG.author.profiles])
    assert.equal(data.basics.website, GLOBAL_CONFIG.author.url)
  })

  test('nests section files and sorts experience present-first', () => {
    const data = buildResumeData([
      entry('experience/old.yaml', {
        company: 'Old Co',
        endDate: '2020-01-01',
        position: 'Engineer',
        startDate: '2018-01-01',
      }),
      entry('experience/now.yaml', {
        company: 'Now Co',
        endDate: null,
        position: 'Lead',
        startDate: '2021-01-01',
      }),
    ])

    assert.deepEqual(
      data.experience.map((item) => item.company),
      ['Now Co', 'Old Co'],
    )
    assert.equal(data.experience[0].id, 'now')
  })

  test('sorts dated arrays newest first', () => {
    const data = buildResumeData([
      entry('awards/early.yaml', { date: '2019-01-01', title: 'Early' }),
      entry('awards/late.yaml', { date: '2024-01-01', title: 'Late' }),
    ])

    assert.deepEqual(
      data.awards.map((item) => item.title),
      ['Late', 'Early'],
    )
  })
})

describe('pickResumeSection', () => {
  const data = buildResumeData([
    entry('basics.yaml', { intro: 'Hi' }),
    entry('skills.yaml', ['TypeScript']),
  ])

  test('returns the named section', () => {
    assert.deepEqual(pickResumeSection(data, 'basics'), {
      email: GLOBAL_CONFIG.author.email,
      intro: 'Hi',
      name: GLOBAL_CONFIG.author.name,
      profiles: [...GLOBAL_CONFIG.author.profiles],
      website: GLOBAL_CONFIG.author.url,
    })
    assert.deepEqual(pickResumeSection(data, 'skills'), ['TypeScript'])
  })

  test('returns null when the section is missing', () => {
    assert.equal(pickResumeSection(data, 'education'), null)
  })
})
