import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { parseContentId } from './content.ts'

describe('parseContentId', () => {
  test('treats a single segment as a top-level section', () => {
    assert.deepEqual(parseContentId('basics.yaml'), {
      isTopLevel: true,
      itemId: '',
      section: 'basics',
    })
  })

  test('splits nested ids into section and item', () => {
    assert.deepEqual(parseContentId('experience/zenbusiness.yaml'), {
      isTopLevel: false,
      itemId: 'zenbusiness',
      section: 'experience',
    })
  })

  test('keeps nested paths after the section', () => {
    assert.deepEqual(parseContentId('experience/nested/item.yml'), {
      isTopLevel: false,
      itemId: 'nested/item',
      section: 'experience',
    })
  })
})
