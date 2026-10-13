import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { toggleClasses } from './toggle-classes.ts'

describe('toggleClasses', () => {
  test('toggles each class token and skips blanks', () => {
    const calls: string[] = []
    const element = {
      classList: {
        toggle(token: string, enabled: boolean) {
          calls.push(`${token}:${enabled}`)
          return enabled
        },
      },
    }

    toggleClasses(element as unknown as Element, 'ring-2  hover:bg-black/5', true)

    assert.deepEqual(calls, ['ring-2:true', 'hover:bg-black/5:true'])
  })
})
