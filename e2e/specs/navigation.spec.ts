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
    await homePage.page.waitForURL('/i-am-a/christian')
    await expect(homePage.main).toBeVisible()

    await homePage.header.homeLink.click()
    await homePage.page.waitForURL('/')
    await expect(homePage.main).toBeVisible()

    if (isMobile) {
      await homePage.header.nav.openMobileMenu()
    } else {
      await homePage.header.nav.openWorkMenu()
    }

    await homePage.header.nav.resumeLink.click()
    await resumePage.page.waitForURL('/resume')
    await expect(resumePage.main).toBeVisible()
  })
})
