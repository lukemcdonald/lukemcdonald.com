import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { applyHighlightedCommand } from './applyHighlightedCommand.ts'

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
