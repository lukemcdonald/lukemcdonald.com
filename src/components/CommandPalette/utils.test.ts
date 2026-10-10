import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  getFoundEggs,
  getPaletteEmptyMessage,
  getSecretsFooterLabel,
  getSecretsProgressLabel,
  isPaletteBackKey,
  isSecretsShortcut,
} from './utils.ts'

function shortcutEvent(overrides: Partial<KeyboardEvent> = {}) {
  return {
    ctrlKey: false,
    key: '.',
    metaKey: true,
    ...overrides,
  } as KeyboardEvent
}

describe('getFoundEggs', () => {
  const eggs = [
    { id: 'aurora', name: 'Aurora' },
    { id: 'hyrule', name: 'Hyrule' },
  ]

  test('returns only eggs that have been found', () => {
    assert.deepEqual(getFoundEggs(eggs, ['aurora']), [{ id: 'aurora', name: 'Aurora' }])
    assert.deepEqual(getFoundEggs(eggs, []), [])
  })
})

describe('getPaletteEmptyMessage', () => {
  test('describes the current page when nothing matches', () => {
    assert.equal(getPaletteEmptyMessage(undefined, 0), 'No matching pages')
    assert.equal(getPaletteEmptyMessage('secrets', 0), 'No secrets found yet')
    assert.equal(getPaletteEmptyMessage('secrets', 1), 'No matching secrets')
  })
})

describe('getSecretsFooterLabel', () => {
  test('uses a compact count until all secrets are found', () => {
    assert.equal(getSecretsFooterLabel(0, 2), 'Secrets 0/2')
    assert.equal(getSecretsFooterLabel(1, 2), 'Secrets 1/2')
    assert.equal(getSecretsFooterLabel(2, 2), 'All secrets found')
  })
})

describe('getSecretsProgressLabel', () => {
  test('counts found eggs until all are found', () => {
    assert.equal(getSecretsProgressLabel(0, 2), 'Secrets: 0 of 2 found')
    assert.equal(getSecretsProgressLabel(1, 2), 'Secrets: 1 of 2 found')
    assert.equal(getSecretsProgressLabel(2, 2), 'All secrets found')
  })
})

describe('isPaletteBackKey', () => {
  test('treats escape or empty-search backspace as back', () => {
    assert.equal(isPaletteBackKey(shortcutEvent({ key: 'Escape' }), 'aurora'), true)
    assert.equal(isPaletteBackKey(shortcutEvent({ key: 'Backspace' }), ''), true)
    assert.equal(isPaletteBackKey(shortcutEvent({ key: 'Backspace' }), 's'), false)
    assert.equal(isPaletteBackKey(shortcutEvent({ key: 'Enter' }), ''), false)
  })
})

describe('isSecretsShortcut', () => {
  test('matches command or control plus period', () => {
    assert.equal(isSecretsShortcut(shortcutEvent()), true)
    assert.equal(isSecretsShortcut(shortcutEvent({ ctrlKey: true, metaKey: false })), true)
    assert.equal(isSecretsShortcut(shortcutEvent({ key: 's', metaKey: true })), false)
    assert.equal(isSecretsShortcut(shortcutEvent({ metaKey: false })), false)
  })
})
