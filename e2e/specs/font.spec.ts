import { expect, test } from '../fixtures'

test.describe('font', { tag: '@smoke' }, () => {
  test('font choice persists across ClientRouter navigation and reload', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
      await homePage.header.nav.mobileFont.selectOption('editorial')
      await homePage.header.nav.closeMobileMenu()
    } else {
      await homePage.header.commandPalette.openWithKeyboard()
      await homePage.header.commandPalette.fontToggle.select('editorial')
      await homePage.header.commandPalette.closeWithKeyboard()
    }

    await expect.poll(() => homePage.storedFontPairing()).toBe('editorial')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'editorial')

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')
    await expect.poll(() => homePage.storedFontPairing()).toBe('editorial')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'editorial')

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect.poll(() => homePage.storedFontPairing()).toBe('editorial')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'editorial')
  })
})
