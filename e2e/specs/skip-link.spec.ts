import { expect, test } from '../fixtures'

test.describe('skip link', { tag: '@a11y' }, () => {
  test('is the first tab stop and still skips to main after ClientRouter navigation', async ({
    homePage,
  }) => {
    await homePage.goto()
    await homePage.skipLink.tabTo()

    await expect(homePage.skipLink.root).toBeFocused()
    await expect(homePage.skipLink.root).toBeInViewport()

    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')

    await homePage.skipLink.tabTo()
    await expect(homePage.skipLink.root).toBeFocused()
    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()
  })
})
