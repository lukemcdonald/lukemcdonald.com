import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { THEME_COLORS } from '@/components/ThemeColor/constants'

import { getThemeInitScript } from './theme.ts'

describe('getThemeInitScript', () => {
  test('ignores unknown stored colors instead of applying them', () => {
    const script = getThemeInitScript()

    assert.ok(script.includes(JSON.stringify(THEME_COLORS)))
    assert.match(script, /\.includes\(storedColorRaw\) \? storedColorRaw : DEFAULT_THEME_COLOR/)
  })
})
