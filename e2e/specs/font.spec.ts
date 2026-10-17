import type { HomePage } from '../pages/home.page'
import type { Locator } from '@playwright/test'

import { FONT_PAIRINGS } from '../../src/components/Settings/Font/pairings'
import { TEST_ID } from '../constants'
import { expect, test } from '../fixtures'

async function chooseAppearance(homePage: HomePage, isMobile: boolean, mode: 'dark' | 'light') {
  if (isMobile) {
    await homePage.header.nav.mobileAppearance.selectOption(mode)
    return
  }

  await homePage.header.commandPalette.themeToggle.select(mode)
}

async function chooseFont(homePage: HomePage, isMobile: boolean, pairing: string) {
  if (isMobile) {
    await homePage.header.nav.mobileFont.selectOption(pairing)
    return
  }

  await homePage.header.commandPalette.fontToggle.select(pairing)
}

async function expectEyebrowsUseHeadingFace(homePage: HomePage) {
  const heading = homePage.page.getByRole('heading', { level: 1 })

  await expect
    .poll(async () => {
      await homePage.page.evaluate(() => {
        return document.fonts.ready
      })

      const headingFamily = await fontFamily(heading)
      const faces = await eyebrowFaces(homePage)
      const [first] = faces

      if (!first || faces.length < 2) {
        return false
      }

      return faces.every((face) => {
        return face.fontFamily === headingFamily && face.fontWeight === first.fontWeight
      })
    })
    .toBe(true)
}

async function expectSelectsUseUiFace(homePage: HomePage) {
  const heading = homePage.page.getByRole('heading', { level: 1 })
  const selects = homePage.header.nav.mobileMenu.locator('select')
  const ui = homePage.page.getByTestId(TEST_ID.siteHeader)

  await expect
    .poll(async () => {
      await homePage.page.evaluate(() => {
        return document.fonts.ready
      })

      const headingFamily = await fontFamily(heading)
      const uiFamily = await fontFamily(ui)
      const faces = await selects.evaluateAll((elements) => {
        return elements.map((el) => {
          return getComputedStyle(el).fontFamily
        })
      })

      if (faces.length === 0) {
        return false
      }

      return faces.every((family) => {
        return family === uiFamily && family !== headingFamily
      })
    })
    .toBe(true)
}

async function eyebrowFaces(homePage: HomePage) {
  return homePage.page.locator('.eyebrow').evaluateAll((elements) => {
    return elements.map((el) => {
      const style = getComputedStyle(el)

      return {
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
      }
    })
  })
}

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

  test('uppercase labels share the pairing heading face and weight', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
    } else {
      await homePage.header.commandPalette.openWithKeyboard()
    }

    for (const pairing of FONT_PAIRINGS) {
      await chooseFont(homePage, isMobile, pairing)
      await expect(homePage.page.locator('html')).toHaveAttribute('data-font', pairing)
      await expectEyebrowsUseHeadingFace(homePage)
      await expectSelectsUseUiFace(homePage)
    }

    await chooseAppearance(homePage, isMobile, 'dark')
    await expect.poll(() => homePage.isDarkMode()).toBe(true)

    for (const pairing of FONT_PAIRINGS) {
      await chooseFont(homePage, isMobile, pairing)
      await expect(homePage.page.locator('html')).toHaveAttribute('data-font', pairing)
      await expectEyebrowsUseHeadingFace(homePage)
      await expectSelectsUseUiFace(homePage)
    }
  })
})
