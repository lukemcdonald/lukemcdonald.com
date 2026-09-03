import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import { applyThemeColor, applyThemeMode, cssColorToHex, syncBrowserThemeColor } from './theme.ts'

describe('cssColorToHex', () => {
  test('passes hex through and expands #rgb', () => {
    assert.equal(cssColorToHex('#b49fce'), '#b49fce')
    assert.equal(cssColorToHex('#ABC'), '#aabbcc')
  })

  test('converts rgb() from getComputedStyle', () => {
    assert.equal(cssColorToHex('rgb(180, 159, 206)'), '#b49fce')
    assert.equal(cssColorToHex('rgb(171 171 157)'), '#abab9d')
  })

  test('returns null for unrecognized colors', () => {
    assert.equal(cssColorToHex(''), null)
  })

  test('converts oklch through a canvas when the browser can rasterize it', () => {
    const previous = globalThis.document

    Object.assign(globalThis, {
      document: {
        createElement() {
          return {
            getContext() {
              return {
                fillRect() {},
                fillStyle: '',
                getImageData() {
                  return { data: [18, 16, 0, 255] }
                },
              }
            },
          }
        },
      },
    })

    try {
      assert.equal(cssColorToHex('oklch(17.1% 0.035 105)'), '#121000')
    } finally {
      globalThis.document = previous
    }
  })
})

function installDom(chromeColor = 'rgb(180, 159, 206)') {
  const attributes = new Map<string, string>()
  const meta = { content: '#abab9d', name: 'theme-color' }
  const html = {
    classList: {
      toggle() {},
    },
    getAttribute(name: string) {
      return attributes.get(name) ?? null
    },
    removeAttribute(name: string) {
      attributes.delete(name)
    },
    setAttribute(name: string, value: string) {
      attributes.set(name, value)
    },
  }

  const previous = {
    document: globalThis.document,
    getComputedStyle: globalThis.getComputedStyle,
    window: globalThis.window,
  }

  Object.assign(globalThis, {
    document: {
      documentElement: html,
      querySelector(selector: string) {
        return selector === 'meta[name="theme-color"]' ? meta : null
      },
    },
    getComputedStyle(el: unknown) {
      if (el === html) {
        return {
          getPropertyValue(name: string) {
            return name === '--chrome-color' ? chromeColor : ''
          },
        }
      }

      return { color: '' }
    },
    window: globalThis,
  })

  return {
    get dataTheme() {
      return attributes.get('data-theme') ?? null
    },
    restore() {
      Object.assign(globalThis, previous)
    },
    get themeColor() {
      return meta.content
    },
  }
}

describe('syncBrowserThemeColor', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('writes --chrome-color to the theme-color meta tag', () => {
    const dom = installDom()
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, '#b49fce')
  })

  test('keeps the fallback when --chrome-color has not loaded', () => {
    const dom = installDom('')
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, '#abab9d')
  })
})

describe('applyThemeColor', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('sets data-theme and syncs the browser chrome color', () => {
    const dom = installDom('rgb(207, 255, 3)')
    restore = () => {
      dom.restore()
    }

    applyThemeColor('neon')

    assert.equal(dom.dataTheme, 'neon')
    assert.equal(dom.themeColor, '#cfff03')
  })
})

describe('applyThemeMode', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('syncs browser chrome color after toggling mode', () => {
    const dom = installDom('rgb(10, 20, 30)')
    restore = () => {
      dom.restore()
    }

    applyThemeMode('dark')

    assert.equal(dom.themeColor, '#0a141e')
  })
})
