import { themeSwatchTestId } from '../constants'
import { expect, test } from '../fixtures'

test.describe('theme', { tag: '@smoke' }, () => {
  test('appearance choice persists across ClientRouter navigation and reload', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
      await homePage.header.nav.mobileAppearance.selectOption('dark')
      await homePage.header.nav.closeMobileMenu()
    } else {
      await homePage.header.commandPalette.openWithKeyboard()
      await homePage.header.commandPalette.themeToggle.select('dark')
      await homePage.header.commandPalette.closeWithKeyboard()
    }

    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')
    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')
  })

  test('color swatch keeps a single theme-color meta', { tag: ['@desktop', '@smoke'] }, async ({
    homePage,
  }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await homePage.page.getByTestId(themeSwatchTestId('blue')).click()

    await expect
      .poll(() => {
        return homePage.page.locator('html').getAttribute('data-theme')
      })
      .toBe('blue')

    const themeColor = homePage.page.locator('meta[name="theme-color"]')

    await expect(themeColor).toHaveCount(1)
    await expect(themeColor).not.toHaveAttribute('media')
  })
})
