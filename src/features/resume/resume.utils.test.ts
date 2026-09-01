import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { assembleResumeData, pickResumeSection } from './resume.utils.ts'

type ResumeStub = Parameters<typeof assembleResumeData>[0][number]

function entry(id: string, data: unknown): ResumeStub {
  return {
    data,
    id,
  } as ResumeStub
}

describe('assembleResumeData', () => {
  test('assigns top-level files as section objects', () => {
    const data = assembleResumeData([entry('basics.yaml', { name: 'Luke McDonald' })])

    assert.deepEqual(data.basics, { name: 'Luke McDonald' })
  })

  test('nests section files and sorts experience present-first', () => {
    const data = assembleResumeData([
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
    const data = assembleResumeData([
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
  const data = assembleResumeData([
    entry('basics.yaml', { name: 'Luke' }),
    entry('skills.yaml', ['TypeScript']),
  ])

  test('returns the named section', () => {
    assert.deepEqual(pickResumeSection(data, 'basics'), { name: 'Luke' })
    assert.deepEqual(pickResumeSection(data, 'skills'), ['TypeScript'])
  })

  test('returns null when the section is missing', () => {
    assert.equal(pickResumeSection(data, 'education'), null)
  })
})
