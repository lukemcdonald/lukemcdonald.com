import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import {
  applyHighlightedCommand,
  getFoundEggs,
  getHighlightedCommand,
  getSecretsFooterLabel,
  getSecretsProgressLabel,
  isSecretsShortcut,
} from './utils.ts'

function createActions() {
  const calls: string[] = []
  const mockClose = mock.fn(() => {
    calls.push('close')
  })
  const mockNavigate = mock.fn((href: string) => {
    calls.push(`navigate:${href}`)
  })
  const mockOnPreferenceApplied = mock.fn(() => {
    calls.push('onPreferenceApplied')
  })
  const mockSetThemeColor = mock.fn((color: string) => {
    calls.push(`setThemeColor:${color}`)
  })
  const mockSetThemeMode = mock.fn((mode: string) => {
    calls.push(`setThemeMode:${mode}`)
  })
  const mockToggleSound = mock.fn(() => {
    calls.push('toggleSound')
  })

  return {
    actions: {
      close: mockClose,
      navigate: mockNavigate,
      onPreferenceApplied: mockOnPreferenceApplied,
      setThemeColor: mockSetThemeColor,
      setThemeMode: mockSetThemeMode,
      toggleSound: mockToggleSound,
    },
    calls,
  }
}

function shortcutEvent(overrides: Partial<KeyboardEvent> = {}) {
  return {
    ctrlKey: false,
    key: '.',
    metaKey: true,
    ...overrides,
  } as KeyboardEvent
}

describe('getHighlightedCommand', () => {
  const navItems = [
    { href: '/resume', name: 'Resume' },
    { href: '/i-am-a/christian', name: 'Christian' },
    { href: '/i-am-a/coach', name: 'Coach' },
  ]

  test('returns nothing for an empty query', () => {
    assert.equal(getHighlightedCommand(navItems, ''), undefined)
    assert.equal(getHighlightedCommand(navItems, '   '), undefined)
  })

  test('prefers the first matching nav item', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'c'), {
      href: '/i-am-a/christian',
      type: 'nav',
    })
  })

  test('matches a theme color when no nav item matches', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'blue'), {
      color: 'blue',
      type: 'color',
    })
  })

  test('matches appearance after colors', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'd'), {
      color: 'default',
      type: 'color',
    })
    assert.deepEqual(getHighlightedCommand(navItems, 'dark'), {
      mode: 'dark',
      type: 'mode',
    })
  })

  test('matches sound when no earlier command matches', () => {
    assert.deepEqual(getHighlightedCommand(navItems, 'sound'), {
      type: 'sound',
    })
  })

  test('does not match an egg name from the main search', () => {
    assert.equal(getHighlightedCommand(navItems, 'aurora'), undefined)
    assert.equal(getHighlightedCommand(navItems, 'hyrule'), undefined)
  })
})

describe('applyHighlightedCommand', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  test('does nothing when there is no command', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, undefined)

    assert.deepEqual(calls, [])
  })

  test('navigates and closes for a nav command', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, { href: '/resume', type: 'nav' })

    assert.deepEqual(calls, ['close', 'navigate:/resume'])
  })

  test('applies a theme color without closing', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, { color: 'blue', type: 'color' })

    assert.deepEqual(calls, ['setThemeColor:blue', 'onPreferenceApplied'])
  })

  test('applies appearance without closing', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, { mode: 'dark', type: 'mode' })

    assert.deepEqual(calls, ['setThemeMode:dark', 'onPreferenceApplied'])
  })

  test('toggles sound without closing', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, { type: 'sound' })

    assert.deepEqual(calls, ['toggleSound', 'onPreferenceApplied'])
  })
})

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

describe('isSecretsShortcut', () => {
  test('matches command or control plus period', () => {
    assert.equal(isSecretsShortcut(shortcutEvent()), true)
    assert.equal(isSecretsShortcut(shortcutEvent({ ctrlKey: true, metaKey: false })), true)
    assert.equal(isSecretsShortcut(shortcutEvent({ key: 's', metaKey: true })), false)
    assert.equal(isSecretsShortcut(shortcutEvent({ metaKey: false })), false)
  })
})
