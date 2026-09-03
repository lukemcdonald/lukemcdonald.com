import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import {
  applyThemeColor,
  applyThemeMode,
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

const CHROME_COLORS = {
  desktopDark: 'rgb(10, 20, 30)',
  desktopLight: 'rgb(250, 248, 246)',
  narrow: 'rgb(180, 159, 206)',
} as const

const HEX = {
  desktopDark: '#0a141e',
  desktopLight: '#faf8f6',
  narrow: '#b49fce',
} as const

function installDom(options: { chromeColor?: string } = {}) {
  const chromeColor = options.chromeColor ?? CHROME_COLORS.narrow

  const attributes = new Map<string, string>()
  const classes = new Set<string>()
  const themeColorMeta: ThemeColorMeta = {
    content: '#abab9d',
    name: 'theme-color',
  }

  const html = {
    appendChild(node: unknown) {
      return node
    },
    classList: {
      contains(name: string) {
        return classes.has(name)
      },
      toggle(name: string, force?: boolean) {
        const shouldAdd = force ?? !classes.has(name)

        if (shouldAdd) {
          classes.add(name)
        } else {
          classes.delete(name)
        }
      },
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
        getContext() {
          return null
        },
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

  test('reads --chrome-color and writes hex to the meta tag', () => {
    const dom = installDom()
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, HEX.narrow)
  })

  test('uses the desktop-light color when CSS sets it', () => {
    const dom = installDom({ chromeColor: CHROME_COLORS.desktopLight })
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, HEX.desktopLight)
  })

  test('uses the desktop-dark color when CSS sets it', () => {
    const dom = installDom({ chromeColor: CHROME_COLORS.desktopDark })
    restore = () => {
      dom.restore()
    }

    syncBrowserThemeColor()

    assert.equal(dom.themeColor, HEX.desktopDark)
  })

  test('keeps the fallback when --chrome-color has not loaded', () => {
    const dom = installDom({ chromeColor: '' })
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
    const dom = installDom({ chromeColor: 'rgb(207, 255, 3)' })
    restore = () => {
      dom.restore()
    }

    applyThemeColor('neon')

    assert.equal(dom.dataTheme, 'neon')
    assert.equal(dom.themeColor, '#cfff03')
  })

  test('clears data-theme for the default palette', () => {
    const dom = installDom({ chromeColor: 'rgb(171, 171, 157)' })
    restore = () => {
      dom.restore()
    }

    applyThemeColor('default')

    assert.equal(dom.dataTheme, null)
    assert.equal(dom.themeColor, '#abab9d')
  })
})

describe('applyThemeMode', () => {
  let restore: (() => void) | undefined

  afterEach(() => {
    restore?.()
    restore = undefined
  })

  test('syncs browser chrome color after toggling dark mode', () => {
    const dom = installDom({ chromeColor: CHROME_COLORS.desktopDark })
    restore = () => {
      dom.restore()
    }

    applyThemeMode('dark')

    assert.equal(dom.themeColor, HEX.desktopDark)
  })
})
