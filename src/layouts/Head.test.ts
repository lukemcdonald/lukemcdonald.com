import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

const headSource = readFileSync(new URL('./Head.astro', import.meta.url), 'utf8')
const publicDir = new URL('../../public/', import.meta.url)

function publicPath(href: string) {
  return fileURLToPath(new URL(href.replace(/^\//, ''), publicDir))
}

function getLinks(source: string) {
  return [...source.matchAll(/<link\b([^>]*?)\/>/gs)].map(([, body]) => {
    const attrs: Record<string, string> = {}

    for (const match of body.matchAll(/([^\s=]+)=(?:"([^"]*)"|{([^}]+)})/g)) {
      attrs[match[1]] = match[2] ?? match[3] ?? ''
    }

    return attrs
  })
}

function getIcoSizes(buffer: Buffer) {
  const count = buffer.readUInt16LE(4)

  return Array.from({ length: count }, (_, index) => {
    const entry = 6 + index * 16
    const height = buffer[entry + 1] || 256
    const width = buffer[entry] || 256

    return { height, width }
  })
}

function parseSize(sizes: string) {
  const match = /^(\d+)x(\d+)$/.exec(sizes)

  assert.ok(match, `manifest icon sizes must be WxH, got ${sizes}`)

  return {
    height: Number(match[2]),
    width: Number(match[1]),
  }
}

describe('head icon links', () => {
  const links = getLinks(headSource)

  test('includes ico, svg, apple-touch, and manifest icons', () => {
    const apple = links.find((link) => {
      return link.rel === 'apple-touch-icon'
    })
    const ico = links.find((link) => {
      return link.rel === 'icon' && link.href === '/favicon.ico'
    })
    const manifest = links.find((link) => {
      return link.rel === 'manifest'
    })
    const svg = links.find((link) => {
      return link.rel === 'icon' && link.type === 'image/svg+xml'
    })

    assert.equal(ico?.href, '/favicon.ico')
    assert.equal(svg?.href, '/favicon.svg')
    assert.equal(apple?.href, '/apple-touch-icon.png')
    assert.equal(manifest?.href, '/site.webmanifest')
  })

  test('linked ico contains 16, 32, and 48 px images', () => {
    const sizes = getIcoSizes(readFileSync(publicPath('/favicon.ico')))
      .map((size) => {
        return size.width
      })
      .toSorted((left, right) => {
        return left - right
      })

    assert.deepEqual(sizes, [16, 32, 48])
  })

  test('linked apple-touch icon is 180x180 opaque RGB', async () => {
    const image = sharp(publicPath('/apple-touch-icon.png'))
    const metadata = await image.metadata()

    assert.equal(metadata.width, 180)
    assert.equal(metadata.height, 180)
    assert.equal(metadata.hasAlpha, false)
    assert.equal(metadata.channels, 3)
  })
})

describe('site.webmanifest icons', () => {
  const manifest = JSON.parse(readFileSync(publicPath('/site.webmanifest'), 'utf8')) as {
    icons: Array<{ sizes: string; src: string }>
  }

  test('every icon entry points at an existing file of the declared size', async () => {
    assert.ok(Array.isArray(manifest.icons))
    assert.ok(manifest.icons.length > 0)

    for (const icon of manifest.icons) {
      const { height, width } = parseSize(icon.sizes)
      const metadata = await sharp(publicPath(icon.src)).metadata()

      assert.equal(metadata.width, width, icon.src)
      assert.equal(metadata.height, height, icon.src)
    }
  })
})
