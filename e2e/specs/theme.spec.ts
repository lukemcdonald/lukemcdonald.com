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
    } else {
      await homePage.header.commandPalette.openWithKeyboard()
      await homePage.header.commandPalette.themeToggle.select('dark')
      await homePage.header.commandPalette.closeWithKeyboard()
    }

    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.page.waitForURL('/i-am-a/christian')
    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect.poll(() => homePage.isDarkMode()).toBe(true)
    await expect.poll(() => homePage.storedThemeMode()).toBe('dark')
  })
})
