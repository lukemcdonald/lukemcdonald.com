import type { KonamiKeyInput, KonamiTarget } from './utils.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { KONAMI_SEQUENCE } from './constants.ts'
import { advanceKonamiProgress, interpretKonamiKey, shouldIgnoreKonamiInput } from './utils.ts'

function keyEvent(overrides: Partial<KonamiKeyInput> = {}): KonamiKeyInput {
  return {
    altKey: false,
    code: 'ArrowUp',
    ctrlKey: false,
    defaultPrevented: false,
    isComposing: false,
    key: 'ArrowUp',
    metaKey: false,
    repeat: false,
    ...overrides,
  }
}

function target(overrides: Partial<KonamiTarget> = {}): KonamiTarget {
  return {
    closestDialog: false,
    isContentEditable: false,
    tagName: 'BODY',
    ...overrides,
  }
}

describe('advanceKonamiProgress', () => {
  test('advances on the next expected code', () => {
    assert.equal(advanceKonamiProgress(0, 'ArrowUp'), 1)
    assert.equal(advanceKonamiProgress(1, 'ArrowUp'), 2)
    assert.equal(advanceKonamiProgress(2, 'ArrowDown'), 3)
  })

  test('restarts when the mismatched code is the first step', () => {
    assert.equal(advanceKonamiProgress(2, 'ArrowUp'), 1)
  })

  test('resets when the code is not next and not the first step', () => {
    assert.equal(advanceKonamiProgress(1, 'KeyA'), 0)
    assert.equal(advanceKonamiProgress(0, 'KeyB'), 0)
  })

  test('completes the full Konami sequence', () => {
    const progress = KONAMI_SEQUENCE.reduce((current, code) => {
      return advanceKonamiProgress(current, code)
    }, 0)

    assert.equal(progress, KONAMI_SEQUENCE.length)
  })
})

describe('shouldIgnoreKonamiInput', () => {
  test('ignores modifier, repeat, composing, and prevented keys', () => {
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ altKey: true }), target()), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ ctrlKey: true }), target()), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ defaultPrevented: true }), target()), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ isComposing: true }), target()), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ metaKey: true }), target()), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent({ repeat: true }), target()), true)
  })

  test('ignores typing in fields, editors, and dialogs', () => {
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target({ tagName: 'INPUT' })), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target({ tagName: 'TEXTAREA' })), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target({ tagName: 'SELECT' })), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target({ isContentEditable: true })), true)
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target({ closestDialog: true })), true)
  })

  test('accepts keys on the page with no target', () => {
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), null), false)
    assert.equal(shouldIgnoreKonamiInput(keyEvent(), target()), false)
  })
})

describe('interpretKonamiKey', () => {
  test('activates after the complete sequence', () => {
    let action = 'ignore'
    let progress = 0

    for (const code of KONAMI_SEQUENCE) {
      const result = interpretKonamiKey(keyEvent({ code, key: code }), target(), {
        active: false,
        progress,
      })

      action = result.action
      progress = result.progress
    }

    assert.equal(action, 'activate')
    assert.equal(progress, 0)
  })

  test('does not capture keys while the effect is already active', () => {
    const result = interpretKonamiKey(keyEvent(), target(), { active: true, progress: 4 })

    assert.deepEqual(result, { action: 'ignore', progress: 4 })
  })

  test('dismisses an active effect on Escape', () => {
    const result = interpretKonamiKey(keyEvent({ code: 'Escape', key: 'Escape' }), target(), {
      active: true,
      progress: 0,
    })

    assert.deepEqual(result, { action: 'dismiss', progress: 0 })
  })

  test('resets in-progress sequence on Escape without activating dismiss', () => {
    const result = interpretKonamiKey(keyEvent({ code: 'Escape', key: 'Escape' }), target(), {
      active: false,
      progress: 3,
    })

    assert.deepEqual(result, { action: 'ignore', progress: 0 })
  })

  test('ignores the sequence while typing in the command palette', () => {
    const result = interpretKonamiKey(
      keyEvent(),
      target({ closestDialog: true, tagName: 'INPUT' }),
      {
        active: false,
        progress: 0,
      },
    )

    assert.deepEqual(result, { action: 'ignore', progress: 0 })
  })
})
