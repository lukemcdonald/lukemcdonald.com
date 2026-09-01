import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { applyHighlightedCommand, getHighlightedCommand } from './utils.ts'

const navItems = [
  { href: '/resume', name: 'Resume' },
  { href: '/i-am-a/christian', name: 'Christian' },
  { href: '/i-am-a/coach', name: 'Coach' },
]

function createActions() {
  const calls: string[] = []

  return {
    actions: {
      close: () => {
        calls.push('close')
      },
      navigate: (href: string) => {
        calls.push(`navigate:${href}`)
      },
      onPreferenceApplied: () => {
        calls.push('onPreferenceApplied')
      },
      setThemeColor: (color: string) => {
        calls.push(`setThemeColor:${color}`)
      },
      setThemeMode: (mode: string) => {
        calls.push(`setThemeMode:${mode}`)
      },
      toggleSound: () => {
        calls.push('toggleSound')
      },
    },
    calls,
  }
}

describe('getHighlightedCommand', () => {
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
})

describe('applyHighlightedCommand', () => {
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
