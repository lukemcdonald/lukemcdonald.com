import type { EasterEggKeyInput, EasterEggTarget } from './types.ts'

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { KONAMI_SEQUENCE } from './eggs/aurora/sequence.ts'
import { advanceSequenceProgress, shouldIgnoreEasterEggInput } from './input.ts'

function keyEvent(overrides: Partial<EasterEggKeyInput> = {}): EasterEggKeyInput {
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

function target(overrides: Partial<EasterEggTarget> = {}): EasterEggTarget {
  return {
    closestDialog: false,
    isContentEditable: false,
    tagName: 'BODY',
    ...overrides,
  }
}

describe('advanceSequenceProgress', () => {
  test('advances on the next expected code', () => {
    assert.equal(advanceSequenceProgress(0, 'ArrowUp', KONAMI_SEQUENCE), 1)
    assert.equal(advanceSequenceProgress(1, 'ArrowUp', KONAMI_SEQUENCE), 2)
    assert.equal(advanceSequenceProgress(2, 'ArrowDown', KONAMI_SEQUENCE), 3)
  })

  test('restarts when the mismatched code is the first step', () => {
    assert.equal(advanceSequenceProgress(2, 'ArrowUp', KONAMI_SEQUENCE), 1)
  })

  test('resets when the code is not next and not the first step', () => {
    assert.equal(advanceSequenceProgress(1, 'KeyA', KONAMI_SEQUENCE), 0)
    assert.equal(advanceSequenceProgress(0, 'KeyB', KONAMI_SEQUENCE), 0)
  })

  test('completes the Konami sequence', () => {
    const progress = KONAMI_SEQUENCE.reduce((current, code) => {
      return advanceSequenceProgress(current, code, KONAMI_SEQUENCE)
    }, 0)

    assert.equal(progress, KONAMI_SEQUENCE.length)
  })
})

describe('shouldIgnoreEasterEggInput', () => {
  test('ignores modifier, repeat, composing, and prevented keys', () => {
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ altKey: true }), target()), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ ctrlKey: true }), target()), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ defaultPrevented: true }), target()), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ isComposing: true }), target()), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ metaKey: true }), target()), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent({ repeat: true }), target()), true)
  })

  test('ignores typing in fields, editors, and dialogs', () => {
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target({ tagName: 'INPUT' })), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target({ tagName: 'TEXTAREA' })), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target({ tagName: 'SELECT' })), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target({ isContentEditable: true })), true)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target({ closestDialog: true })), true)
  })

  test('accepts keys on the page with no target', () => {
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), null), false)
    assert.equal(shouldIgnoreEasterEggInput(keyEvent(), target()), false)
  })
})
