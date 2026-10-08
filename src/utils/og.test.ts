import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { renderOgPng } from './og.render.ts'
import {
  buildOgSvg,
  DEFAULT_OG_IMAGE_PATH,
  getOgImagePath,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MARK,
  OG_IMAGE_WIDTH,
} from './og.ts'

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

describe('getOgImagePath', () => {
  test('maps the homepage to the default generated image', () => {
    assert.equal(getOgImagePath('/'), DEFAULT_OG_IMAGE_PATH)
  })

  test('maps nested routes onto /og/*.png', () => {
    assert.equal(getOgImagePath('/resume'), '/og/resume.png')
    assert.equal(getOgImagePath('/i-am-a/father/'), '/og/i-am-a/father.png')
  })
})

describe('buildOgSvg', () => {
  test('includes the title, mark, and 1200x630 canvas', () => {
    const svg = buildOgSvg({ title: 'Father' })

    assert.match(svg, /width="1200"/)
    assert.match(svg, /height="630"/)
    assert.match(svg, />Father</)
    assert.match(svg, new RegExp(OG_IMAGE_MARK))
    assert.equal(OG_IMAGE_WIDTH, 1200)
    assert.equal(OG_IMAGE_HEIGHT, 630)
  })

  test('escapes XML in the title', () => {
    const svg = buildOgSvg({ title: 'Luke & Sons <Home>' })

    assert.match(svg, /Luke &amp; Sons &lt;Home&gt;/)
    assert.doesNotMatch(svg, /Luke & Sons <Home>/)
  })
})

describe('renderOgPng', () => {
  test('returns a PNG buffer', () => {
    const png = renderOgPng({ title: 'Father' })

    assert.equal(png.subarray(0, 8).equals(PNG_MAGIC), true)
    assert.ok(png.byteLength > 1024)
  })
})
