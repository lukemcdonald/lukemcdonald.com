import type { EasterEgg } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { decideCompletedEggs, escapeDismissesEgg } from './decide.ts'

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
const burst = egg({ id: 'burst' })

describe('escapeDismissesEgg', () => {
  test('dismisses timed eggs only', () => {
    assert.equal(escapeDismissesEgg('timed'), true)
    assert.equal(escapeDismissesEgg('toggle'), false)
    assert.equal(escapeDismissesEgg(undefined), false)
  })
})

describe('decideCompletedEggs', () => {
  test('idles when nothing completed', () => {
    assert.deepEqual(
      decideCompletedEggs('aurora', [], { staticId: 'aurora', strategy: 'static' }),
      {
        kind: 'idle',
      },
    )
  })

  test('activates the picked egg', () => {
    assert.deepEqual(
      decideCompletedEggs(undefined, [aurora], { staticId: 'aurora', strategy: 'static' }),
      { egg: aurora, kind: 'activate' },
    )
  })

  test('deactivates the same toggle egg', () => {
    assert.deepEqual(
      decideCompletedEggs('aurora', [aurora], { staticId: 'aurora', strategy: 'static' }),
      { kind: 'deactivate' },
    )
  })

  test('replaces by activating the newly picked egg', () => {
    assert.deepEqual(
      decideCompletedEggs('aurora', [burst], { staticId: 'burst', strategy: 'static' }),
      { egg: burst, kind: 'activate' },
    )
  })
})
