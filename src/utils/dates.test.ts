import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  formatMonthYear,
  sortByAccessorDateDesc,
  sortByDateDesc,
  sortExperienceByEndDate,
  toDate,
} from './dates.ts'

describe('toDate', () => {
  test('returns a valid Date instance unchanged', () => {
    const date = new Date('2024-06-15T00:00:00.000Z')

    assert.equal(toDate(date), date)
  })

  test('parses ISO date strings', () => {
    const date = toDate('2024-01-15')

    assert.ok(date instanceof Date)
    assert.equal(date?.toISOString().startsWith('2024-01-15'), true)
  })

  test('parses timestamps', () => {
    const timestamp = Date.parse('2020-05-01T00:00:00.000Z')
    const date = toDate(timestamp)

    assert.equal(date?.toISOString(), '2020-05-01T00:00:00.000Z')
  })

  test('returns null for empty values', () => {
    assert.equal(toDate(null), null)
    assert.equal(toDate(undefined), null)
    assert.equal(toDate(''), null)
  })

  test('returns null for invalid strings', () => {
    assert.equal(toDate('not-a-date'), null)
  })
})

describe('formatMonthYear', () => {
  test('formats a UTC date as Mon YYYY', () => {
    assert.equal(formatMonthYear('2023-01-15'), 'Jan 2023')
  })

  test('returns null when the value cannot be parsed', () => {
    assert.equal(formatMonthYear('nope'), null)
  })
})

describe('sortByAccessorDateDesc', () => {
  test('sorts dated items newest first and pushes missing dates last', () => {
    const items = [
      { id: 'old', when: '2020-01-01' },
      { id: 'none', when: null },
      { id: 'new', when: '2024-01-01' },
    ]

    const sorted = sortByAccessorDateDesc(items, (item) => item.when)

    assert.deepEqual(
      sorted.map((item) => item.id),
      ['new', 'old', 'none'],
    )
  })
})

describe('sortByDateDesc', () => {
  test('uses date then startDate when no accessor is given', () => {
    const items = [
      { id: 'start-only', startDate: '2021-06-01' },
      { date: '2023-01-01', id: 'dated' },
    ]

    const sorted = sortByDateDesc(items)

    assert.deepEqual(
      sorted.map((item) => item.id),
      ['dated', 'start-only'],
    )
  })
})

describe('sortExperienceByEndDate', () => {
  test('puts present roles first, then newest end dates', () => {
    const items = [
      { endDate: '2020-01-01', id: 'old' },
      { endDate: 'present', id: 'current' },
      { endDate: '2023-06-01', id: 'recent' },
    ]

    const sorted = sortExperienceByEndDate(items)

    assert.deepEqual(
      sorted.map((item) => item.id),
      ['current', 'recent', 'old'],
    )
  })
})
