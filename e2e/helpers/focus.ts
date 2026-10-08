import type { Locator } from '@playwright/test'

export function readFocusRing(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element)

    return {
      outlineColor: style.outlineColor,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      position: style.position,
    }
  })
}
