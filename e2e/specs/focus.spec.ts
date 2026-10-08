import { expect, test } from '../fixtures'
import { readFocusRing } from '../helpers/focus'

test.describe('visible focus', { tag: '@a11y' }, () => {
  test('keyboard focus shows a non-zero outline on interactive chrome', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()
    await homePage.skipLink.tabTo()
    await expect(homePage.skipLink.root).toBeFocused()

    const skipRing = await readFocusRing(homePage.skipLink.root)
    expect(skipRing.outlineStyle).not.toBe('none')
    expect(skipRing.outlineWidth).toBeGreaterThan(0)

    await homePage.page.keyboard.press('Tab')
    await expect(homePage.header.homeLink).toBeFocused()

    const homeRing = await readFocusRing(homePage.header.homeLink)
    expect(homeRing.outlineStyle).not.toBe('none')
    expect(homeRing.outlineWidth).toBeGreaterThan(0)

    await homePage.page.keyboard.press('Tab')

    if (isMobile) {
      await expect(homePage.header.nav.mobileMenuTrigger).toBeFocused()
      const menuRing = await readFocusRing(homePage.header.nav.mobileMenuTrigger)
      expect(menuRing.outlineStyle).not.toBe('none')
      expect(menuRing.outlineWidth).toBeGreaterThan(0)
      return
    }

    await expect(homePage.header.nav.workMenuTrigger).toBeFocused()
    const navRing = await readFocusRing(homePage.header.nav.workMenuTrigger)
    expect(navRing.outlineStyle).not.toBe('none')
    expect(navRing.outlineWidth).toBeGreaterThan(0)
  })
})
