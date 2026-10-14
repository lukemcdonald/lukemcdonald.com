import type { HomePage } from '../pages/home.page'
import type { Locator } from '@playwright/test'

import { expect, test } from '../fixtures'

async function fontFamily(locator: Locator) {
  return locator.evaluate((el) => {
    return getComputedStyle(el).fontFamily
  })
}

async function selectFont(homePage: HomePage, isMobile: boolean, pairing: string) {
  if (isMobile) {
    await homePage.header.nav.openMobileMenu()
    await homePage.header.nav.mobileFont.selectOption(pairing)
    await homePage.header.nav.closeMobileMenu()
    return
  }

  await homePage.header.commandPalette.openWithKeyboard()
  await homePage.header.commandPalette.fontToggle.select(pairing)
  await homePage.header.commandPalette.closeWithKeyboard()
}

test.describe('font', { tag: '@smoke' }, () => {
  test('font choice applies and persists across navigation and reload', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    const heading = homePage.page.getByRole('heading', { level: 1 })
    const defaultHeadingFace = await fontFamily(heading)

    await selectFont(homePage, isMobile, 'work')

    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')
    await expect.poll(() => fontFamily(heading)).not.toBe(defaultHeadingFace)

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')
  })

  test('selecting the active font again restores the default', async ({ homePage, isMobile }) => {
    await homePage.goto()
    await selectFont(homePage, isMobile, 'work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
      await homePage.header.nav.mobileFont.selectOption({ label: 'Default' })
      await homePage.header.nav.closeMobileMenu()
    } else {
      await homePage.header.commandPalette.openWithKeyboard()
      await homePage.header.commandPalette.fontToggle.select('work')
      await homePage.header.commandPalette.closeWithKeyboard()
    }

    await expect.poll(() => homePage.storedFontPairing()).toBeNull()
    await expect(homePage.page.locator('html')).not.toHaveAttribute('data-font')
  })
})
