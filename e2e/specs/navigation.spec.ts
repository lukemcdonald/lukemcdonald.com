import { commandPalettePageTestId } from '../constants'
import { expect, test } from '../fixtures'

test.describe('navigation', { tag: '@smoke' }, () => {
  test('ClientRouter navigation via the menu keeps the document and chrome without a full reload', async ({
    homePage,
    isMobile,
  }) => {
    await homePage.goto()
    await expect(homePage.header.root).toBeVisible()
    await expect(homePage.header.nav.root).toBeVisible()
    await homePage.markClientRouter()
    await homePage.page.mouse.move(0, 0)

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
      await homePage.header.nav.mobileLink('/i-am-a/christian').click()
    } else {
      await homePage.header.nav.openLiveMenu()
      await homePage.header.nav.desktopLink('/i-am-a/christian').click()
    }

    await homePage.waitForPath('/i-am-a/christian')
    expect(await homePage.wasClientRouterPreserved()).toBe(true)

    await homePage.header.homeLink.click()
    await homePage.waitForPath('/')
    await homePage.page.mouse.move(0, 0)

    expect(await homePage.wasClientRouterPreserved()).toBe(true)
    await expect(homePage.header.root).toBeVisible()
    await expect(homePage.header.nav.root).toBeVisible()
  })

  test('keeps work history pages out of the Work menu and in the command palette', async ({
    homePage,
    isMobile,
  }) => {
    const workPages = ['/work/audiotheme', '/work/blazer-six', '/work/cedaro', '/work/celtic7']

    await homePage.goto()

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
      await expect(homePage.header.nav.mobileLink('/resume')).toBeVisible()

      for (const href of workPages) {
        await expect(homePage.header.nav.mobileLink(href)).toHaveCount(0)
      }

      return
    }

    await homePage.header.nav.openWorkMenu()
    await expect(homePage.header.nav.desktopLink('/resume')).toBeVisible()

    for (const href of workPages) {
      await expect(homePage.header.nav.desktopLink(href)).toHaveCount(0)
    }

    const palette = homePage.header.commandPalette
    const work = palette.navGroup('Work')

    await palette.openWithKeyboard()
    await expect(work.getByTestId(commandPalettePageTestId('/resume'))).toBeVisible()

    for (const href of workPages) {
      await expect(work.getByTestId(commandPalettePageTestId(href))).toBeVisible()
    }
  })
})
