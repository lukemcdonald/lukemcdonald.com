import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { LINK_CUE_PROPS, PRESS_CUE_PROPS, SOFT_LINK_CUE_PROPS, TOGGLE_CUE_PROPS } from './constants'

describe('link cue props', () => {
  test('include hover for mice and toggle for tap and keyboard', () => {
    assert.equal(LINK_CUE_PROPS['data-cuelume-hover'], 'tick')
    assert.equal(LINK_CUE_PROPS['data-cuelume-toggle'], true)
  })

  test('soft links keep whisper hover and the same tap cue', () => {
    assert.equal(SOFT_LINK_CUE_PROPS['data-cuelume-hover'], 'whisper')
    assert.equal(SOFT_LINK_CUE_PROPS['data-cuelume-toggle'], true)
  })
})

describe('control cue props', () => {
  test('press cues pair pointer down and up', () => {
    assert.equal(PRESS_CUE_PROPS['data-cuelume-press'], true)
    assert.equal(PRESS_CUE_PROPS['data-cuelume-release'], true)
  })

  test('toggle cues stay click-only', () => {
    assert.equal(TOGGLE_CUE_PROPS['data-cuelume-toggle'], true)
    assert.equal('data-cuelume-hover' in TOGGLE_CUE_PROPS, false)
  })
})
