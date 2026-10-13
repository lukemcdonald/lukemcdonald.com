import type { HomePage } from '../pages/home.page'
import type { Locator } from '@playwright/test'

import { expect, test } from '../fixtures'

const PAIRING_FACES = {
  live: { body: /Inter/i, heading: /Fraunces/i, nav: /Inter/i },
  play: { body: /Space Mono/i, heading: /Bricolage/i, nav: /Space Mono/i },
  work: { body: /IBM Plex Sans/i, heading: /IBM Plex Sans/i, nav: /IBM Plex Mono/i },
} as const

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
  test('font choice persists across ClientRouter navigation and reload', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    await selectFont(homePage, isMobile, 'work')

    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')
    await expect(homePage.page.locator('html')).toHaveAttribute('data-font', 'work')
  })

  test('each pairing restyles headings, body, and nav without breaking the homepage card', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    const body = homePage.greetingLink('/i-am-a/christian')
    const heading = homePage.page.getByRole('heading', { level: 1 })
    const nav =
      isMobile ? homePage.header.nav.mobileMenuTrigger : homePage.header.nav.workMenuTrigger
    const site = homePage.page.locator('.site')

    for (const [pairing, faces] of Object.entries(PAIRING_FACES)) {
      await selectFont(homePage, isMobile, pairing)
      await expect(homePage.page.locator('html')).toHaveAttribute('data-font', pairing)
      await expect.poll(() => fontFamily(heading)).toMatch(faces.heading)
      await expect.poll(() => fontFamily(body)).toMatch(faces.body)
      await expect.poll(() => fontFamily(nav)).toMatch(faces.nav)

      if (!isMobile) {
        const palette = homePage.header.commandPalette

        await palette.openWithKeyboard()
        await expect.poll(() => fontFamily(palette.input)).toMatch(faces.nav)
        await expect.poll(() => fontFamily(palette.trigger)).toMatch(faces.nav)
        await palette.closeWithKeyboard()
      }

      await expect(heading).toBeVisible()
      await expect(body).toBeVisible()
      expect(await site.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(2)
    }
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
