import assert from 'node:assert/strict'
import { afterEach, describe, mock, test } from 'node:test'

import {
  applyHighlightedCommand,
  getHighlightedCommand,
  getSecretsProgressLabel,
  getVisibleSecrets,
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
  const mockToggleEgg = mock.fn((id: string) => {
    calls.push(`toggleEgg:${id}`)
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
      toggleEgg: mockToggleEgg,
      toggleSound: mockToggleSound,
    },
    calls,
  }
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

  test('matches a found egg after nav items', () => {
    assert.deepEqual(
      getHighlightedCommand(navItems, 'aurora', [{ id: 'aurora', name: 'Aurora' }]),
      {
        eggId: 'aurora',
        type: 'egg',
      },
    )
  })

  test('does not match an unfound egg', () => {
    assert.equal(getHighlightedCommand(navItems, 'aurora'), undefined)
    assert.equal(
      getHighlightedCommand(navItems, 'aurora', [{ id: 'hyrule', name: 'Hyrule' }]),
      undefined,
    )
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

  test('toggles a found egg without closing', () => {
    const { actions, calls } = createActions()

    applyHighlightedCommand(actions, { eggId: 'aurora', type: 'egg' })

    assert.deepEqual(calls, ['toggleEgg:aurora', 'onPreferenceApplied'])
  })
})

describe('getSecretsProgressLabel', () => {
  test('counts found eggs until all are found', () => {
    assert.equal(getSecretsProgressLabel(0, 2), 'Secrets: 0 of 2 found')
    assert.equal(getSecretsProgressLabel(1, 2), 'Secrets: 1 of 2 found')
    assert.equal(getSecretsProgressLabel(2, 2), 'All secrets found')
  })
})

describe('getVisibleSecrets', () => {
  const eggs = [
    { id: 'aurora', name: 'Aurora' },
    { id: 'hyrule', name: 'Hyrule' },
  ]

  test('hides unfound eggs and shows progress when the query is empty', () => {
    const visible = getVisibleSecrets(eggs, ['aurora'], '')

    assert.equal(visible.progressLabel, 'Secrets: 1 of 2 found')
    assert.equal(visible.showProgress, true)
    assert.equal(visible.showSecrets, true)
    assert.deepEqual(visible.visibleFoundEggs, [{ id: 'aurora', name: 'Aurora' }])
  })

  test('does not make unfound eggs searchable', () => {
    const visible = getVisibleSecrets(eggs, ['aurora'], 'hyrule')

    assert.equal(visible.showProgress, false)
    assert.equal(visible.showSecrets, false)
    assert.deepEqual(visible.visibleFoundEggs, [])
  })

  test('matches a found egg name without revealing the progress line', () => {
    const visible = getVisibleSecrets(eggs, ['aurora'], 'aurora')

    assert.equal(visible.showProgress, false)
    assert.deepEqual(visible.visibleFoundEggs, [{ id: 'aurora', name: 'Aurora' }])
  })
})
