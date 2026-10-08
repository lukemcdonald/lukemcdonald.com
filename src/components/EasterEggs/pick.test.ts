import type { EasterEgg } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { matchesSchedule, pickEgg } from './pick.ts'

const sequence = ['KeyA'] as const

function egg(overrides: Partial<EasterEgg> & Pick<EasterEgg, 'id'>): EasterEgg {
  return {
    durationMs: 1000,
    mode: 'timed',
    name: overrides.id,
    trigger: { codes: sequence, type: 'sequence' },
    ...overrides,
  }
}

const aurora = egg({ id: 'aurora', mode: 'toggle' })
const holiday = egg({
  id: 'holiday',
  schedule: {
    end: { day: 5, month: 1 },
    kind: 'range',
    start: { day: 20, month: 12 },
  },
})
const summer = egg({
  id: 'summer',
  schedule: { kind: 'season', seasons: ['summer'] },
})
const january = egg({
  id: 'january',
  schedule: { kind: 'month', months: [1] },
})

describe('pickEgg', () => {
  test('returns nothing for an empty list', () => {
    assert.equal(pickEgg([], { staticId: 'aurora', strategy: 'static' }), undefined)
  })

  test('static strategy uses the named id and falls back to the first egg', () => {
    assert.equal(pickEgg([holiday, aurora], { staticId: 'aurora', strategy: 'static' }), aurora)
    assert.equal(pickEgg([holiday, aurora], { staticId: 'missing', strategy: 'static' }), holiday)
  })

  test('random strategy uses the injected rng', () => {
    const eggs = [aurora, holiday, summer]

    assert.equal(pickEgg(eggs, { random: () => 0, strategy: 'random' }), aurora)
    assert.equal(pickEgg(eggs, { random: () => 0.99, strategy: 'random' }), summer)
  })

  test('schedule strategy prefers a matching window over year-round eggs', () => {
    assert.equal(
      pickEgg([aurora, holiday, summer], {
        date: new Date(2026, 11, 25),
        strategy: 'schedule',
      })?.id,
      'holiday',
    )
    assert.equal(
      pickEgg([aurora, holiday, summer], {
        date: new Date(2026, 6, 4),
        strategy: 'schedule',
      })?.id,
      'summer',
    )
    assert.equal(
      pickEgg([aurora, holiday, summer], {
        date: new Date(2026, 2, 10),
        strategy: 'schedule',
      })?.id,
      'aurora',
    )
    assert.equal(
      pickEgg([holiday, summer], {
        date: new Date(2026, 2, 10),
        strategy: 'schedule',
      }),
      undefined,
    )
  })
})

describe('matchesSchedule', () => {
  test('treats eggs without a schedule as unscheduled', () => {
    assert.equal(matchesSchedule(aurora, new Date(2026, 0, 1)), false)
  })

  test('matches month windows', () => {
    assert.equal(matchesSchedule(january, new Date(2026, 0, 12)), true)
    assert.equal(matchesSchedule(january, new Date(2026, 1, 12)), false)
  })

  test('matches seasons', () => {
    assert.equal(matchesSchedule(summer, new Date(2026, 5, 21)), true)
    assert.equal(matchesSchedule(summer, new Date(2026, 11, 21)), false)
  })

  test('matches year-wrapping date ranges', () => {
    assert.equal(matchesSchedule(holiday, new Date(2026, 11, 20)), true)
    assert.equal(matchesSchedule(holiday, new Date(2026, 11, 25)), true)
    assert.equal(matchesSchedule(holiday, new Date(2027, 0, 2)), true)
    assert.equal(matchesSchedule(holiday, new Date(2027, 0, 5)), true)
    assert.equal(matchesSchedule(holiday, new Date(2026, 11, 19)), false)
    assert.equal(matchesSchedule(holiday, new Date(2027, 0, 6)), false)
    assert.equal(matchesSchedule(holiday, new Date(2026, 6, 1)), false)
  })
})
