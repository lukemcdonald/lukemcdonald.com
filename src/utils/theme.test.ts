import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import {
  applyThemeColor,
  cssColorToHex,
  getBrowserThemeColor,
  syncBrowserThemeColor,
} from './theme.ts'

describe('cssColorToHex', () => {
  test('passes hex through and expands #rgb', () => {
    assert.equal(cssColorToHex('#b49fce'), '#b49fce')
    assert.equal(cssColorToHex('#ABC'), '#aabbcc')
  })

  test('converts rgb() from getComputedStyle', () => {
    assert.equal(cssColorToHex('rgb(180, 159, 206)'), '#b49fce')
    assert.equal(cssColorToHex('rgba(207, 255, 3, 1)'), '#cfff03')
    assert.equal(cssColorToHex('rgb(171 171 157)'), '#abab9d')
    assert.equal(cssColorToHex('rgb(144 173 204 / 1)'), '#90adcc')
  })

  test('returns null for unrecognized colors', () => {
    assert.equal(cssColorToHex('oklch(73.7% 0.07 305)'), null)
    assert.equal(cssColorToHex(''), null)
  })
})

describe('getBrowserThemeColor', () => {
  test('returns a hex fallback when CSS is unavailable', () => {
    assert.equal(getBrowserThemeColor('#abab9d'), '#abab9d')
    assert.equal(getBrowserThemeColor('#ABC'), '#aabbcc')
  })
})

type ThemeColorMeta = {
  content: string
  name: string
}

function installDom(options: { computedColor?: string; token?: string } = {}) {
  const { computedColor = 'rgb(180, 159, 206)', token = 'oklch(73.7% 0.07 305)' } = options

  const attributes = new Map<string, string>()
  const themeColorMeta: ThemeColorMeta = {
    content: '#abab9d',
    name: 'theme-color',
  }

  const html = {
    appendChild(node: unknown) {
      return node
    },
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

  const document = {
    createElement() {
      return {
        remove() {},
        style: {
          color: '',
        },
      }
    },
    documentElement: html,
    querySelector(selector: string) {
      if (selector === 'meta[name="theme-color"]') {
        return themeColorMeta
      }

      return null
    },
  }

  const previous = {
    document: globalThis.document,
    getComputedStyle: globalThis.getComputedStyle,
    window: globalThis.window,
  }

  Object.assign(globalThis, {
    document,
    getComputedStyle(el: { style?: { color?: string } }) {
      if (el === html) {
        return {
          getPropertyValue(name: string) {
            return name === '--color-primary-500' ? token : ''
          },
        }
      }

      return {
        color: computedColor,
      }
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
      return themeColorMeta.content
    },
  }
}

describe('syncBrowserThemeColor', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('updates the theme-color meta tag from --color-primary-500', () => {
    const dom = installDom()
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, '#b49fce')
  })

  test('keeps the fallback when the primary token has not loaded', () => {
    const dom = installDom({ token: '' })
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
    const dom = installDom({ computedColor: 'rgb(207, 255, 3)' })
    restore = () => {
      dom.restore()
    }

    applyThemeColor('neon')

    assert.equal(dom.dataTheme, 'neon')
    assert.equal(dom.themeColor, '#cfff03')
  })

  test('clears data-theme for the default palette', () => {
    const dom = installDom({ computedColor: 'rgb(171, 171, 157)' })
    restore = () => {
      dom.restore()
    }

    applyThemeColor('default')

    assert.equal(dom.dataTheme, null)
    assert.equal(dom.themeColor, '#abab9d')
  })
})
