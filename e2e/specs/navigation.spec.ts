import { expect, test } from '../fixtures'

test.describe('navigation', { tag: '@smoke' }, () => {
  test('ClientRouter navigation between pages keeps chrome working', async ({
    homePage,
    isMobile,
    resumePage,
  }) => {
    await homePage.goto()
    await expect(homePage.header.root).toBeVisible()
    await expect(homePage.header.nav.root).toBeVisible()

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')

    await homePage.header.homeLink.click()
    await homePage.waitForPath('/')
    await homePage.page.mouse.move(0, 0)

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
    } else {
      await homePage.header.nav.openWorkMenu()
    }

    await homePage.header.nav.resumeLink.click()
    await resumePage.waitForPath('/resume')
  })
})
