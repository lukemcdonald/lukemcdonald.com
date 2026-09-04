import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import { applyThemeColor, cssColorToHex, syncBrowserThemeColor } from './theme.ts'

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
})

type ThemeColorMeta = {
  content: string
  name: string
  remove: () => void
}

function installDom(options: { computedColor?: string; token?: string } = {}) {
  const computedColor = options.computedColor ?? 'rgb(180, 159, 206)'
  const token = options.token ?? 'oklch(73.7% 0.07 305)'

  const attributes = new Map<string, string>()
  let themeColorMeta: ThemeColorMeta | null = {
    content: '#122023',
    name: 'theme-color',
    remove() {
      themeColorMeta = null
    },
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

  const previous = {
    document: globalThis.document,
    getComputedStyle: globalThis.getComputedStyle,
    window: globalThis.window,
  }

  Object.assign(globalThis, {
    document: {
      createElement(tag: string) {
        if (tag === 'meta') {
          return {
            content: '',
            name: '',
            remove() {
              if (themeColorMeta === this) {
                themeColorMeta = null
              }
            },
          } satisfies ThemeColorMeta
        }

        return {
          remove() {},
          style: {
            color: '',
          },
        }
      },
      documentElement: html,
      head: {
        appendChild(el: ThemeColorMeta) {
          themeColorMeta = el

          return el
        },
      },
      querySelector(selector: string) {
        return selector === 'meta[name="theme-color"]' ? themeColorMeta : null
      },
    },
    getComputedStyle(el: unknown) {
      if (el === html) {
        return {
          getPropertyValue(name: string) {
            return name === '--color-primary-500' ? token : ''
          },
        }
      }

      return { color: computedColor }
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
      return themeColorMeta?.content ?? null
    },
  }
}

describe('syncBrowserThemeColor', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('replaces the theme-color meta tag with the header color', () => {
    const dom = installDom()
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, '#b49fce')
  })

  test('keeps the dark fallback when the header token has not loaded', () => {
    const dom = installDom({ token: '' })
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, '#122023')
  })
})

describe('applyThemeColor', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('sets data-theme and syncs the top chrome color', () => {
    const dom = installDom({ computedColor: 'rgb(207, 255, 3)' })
    restore = () => {
      dom.restore()
    }

    applyThemeColor('neon')

    assert.equal(dom.dataTheme, 'neon')
    assert.equal(dom.themeColor, '#cfff03')
  })
})
