import type { Locator } from '@playwright/test'

import { expect, test } from '../fixtures'
import { readFocusRing } from '../helpers/focus'

test.describe('visible focus', { tag: '@a11y' }, () => {
  test('keyboard focus shows a non-transparent outline on representative chrome', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()
    await homePage.skipLink.tabTo()
    await expectVisibleFocus(homePage.skipLink.root)

    await homePage.page.keyboard.press('Tab')
    await expectVisibleFocus(homePage.header.homeLink)

    await homePage.page.keyboard.press('Tab')

    if (isMobile) {
      await expectVisibleFocus(homePage.header.nav.mobileMenuTrigger)
      return
    }

    await expectVisibleFocus(homePage.header.nav.workMenuTrigger)
  })
})

async function expectVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused()

  const ring = await readFocusRing(locator)

  expect(ring.outlineStyle).not.toBe('none')
  expect(ring.outlineWidth).toBeGreaterThan(0)
  expect(ring.outlineColor).not.toBe('transparent')
  expect(ring.outlineColor).not.toBe('rgba(0, 0, 0, 0)')
}
