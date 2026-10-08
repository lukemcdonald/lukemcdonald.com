import type { Locator } from '@playwright/test'

export function readFocusRing(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)

    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      position: style.position,
    }
  })
}

export function readBox(locator: Locator) {
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()

    return {
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y,
    }
  })
}
