import assert from 'node:assert/strict'
import { join } from 'node:path'
import { describe, test } from 'node:test'

import { renderOgPng, resolveOgPhotoPath } from './og.render.ts'
import {
  buildOgSvg,
  DEFAULT_OG_IMAGE_PATH,
  getOgImagePath,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_MARK,
  OG_IMAGE_WIDTH,
  OG_PHOTO_WIDTH,
} from './og.ts'

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
const MUSTACHIO = join(process.cwd(), 'src/assets/images/luke-mustachio.jpg')

describe('getOgImagePath', () => {
  test('maps the homepage to the default generated image', () => {
    assert.equal(getOgImagePath('/'), DEFAULT_OG_IMAGE_PATH)
  })

  test('maps nested routes onto /og/*.png', () => {
    assert.equal(getOgImagePath('/resume'), '/og/resume.png')
    assert.equal(getOgImagePath('/i-am-a/father/'), '/og/i-am-a/father.png')
  })
})

describe('resolveOgPhotoPath', () => {
  test('resolves a content image src to the local asset', () => {
    assert.equal(resolveOgPhotoPath({ src: '/src/assets/images/luke-mustachio.jpg' }), MUSTACHIO)
    assert.equal(resolveOgPhotoPath({ src: '/_astro/luke-mustachio.Dabc12.jpg' }), MUSTACHIO)
  })

  test('returns undefined when the image is missing', () => {
    assert.equal(resolveOgPhotoPath(), undefined)
    assert.equal(resolveOgPhotoPath({ src: '/src/assets/images/nope.jpg' }), undefined)
  })
})

describe('buildOgSvg', () => {
  test('includes the title, mark, and 1200x630 canvas', () => {
    const svg = buildOgSvg({ title: 'Father' })

    assert.match(svg, /width="1200"/)
    assert.match(svg, /height="630"/)
    assert.match(svg, />Father</)
    assert.match(svg, new RegExp(OG_IMAGE_MARK))
    assert.doesNotMatch(svg, /<image /)
    assert.equal(OG_IMAGE_WIDTH, 1200)
    assert.equal(OG_IMAGE_HEIGHT, 630)
  })

  test('places a photo flush on the right when a data URI is provided', () => {
    const svg = buildOgSvg({
      photoDataUri: 'data:image/jpeg;base64,abc',
      title: 'Father',
    })

    assert.match(svg, /<image href="data:image\/jpeg;base64,abc"/)
    assert.match(svg, new RegExp(`x="${OG_IMAGE_WIDTH - OG_PHOTO_WIDTH}"`))
    assert.match(svg, /preserveAspectRatio="xMidYMid slice"/)
  })

  test('wraps a long title before it reaches the photo', () => {
    const svg = buildOgSvg({
      photoDataUri: 'data:image/jpeg;base64,abc',
      title: 'Luke McDonald',
    })

    assert.match(svg, />Luke</)
    assert.match(svg, />McDonald</)
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

  test('different titles produce different images', () => {
    const father = renderOgPng({ title: 'Father' })
    const resume = renderOgPng({ title: 'Resume' })

    assert.equal(father.equals(resume), false)
  })

  test('embedding a photo changes the rendered bytes', () => {
    const plain = renderOgPng({ title: 'Luke McDonald' })
    const withPhoto = renderOgPng({ photoPath: MUSTACHIO, title: 'Luke McDonald' })

    assert.equal(plain.equals(withPhoto), false)
    assert.ok(withPhoto.byteLength > plain.byteLength)
  })
})
