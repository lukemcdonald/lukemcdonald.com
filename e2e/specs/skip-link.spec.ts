import { expect, test } from '../fixtures'

test.describe('skip link', { tag: '@a11y' }, () => {
  test('is the first tab stop, becomes visible, and still skips to main after ClientRouter navigation', async ({
    homePage,
  }) => {
    await homePage.goto()
    await homePage.skipLink.tabTo()

    await expect(homePage.skipLink.root).toBeFocused()
    await expect(homePage.skipLink.root).toHaveRole('link')
    await expect(homePage.skipLink.root).toHaveAccessibleName('Skip to content')
    await expect(homePage.skipLink.root).toBeInViewport()

    const box = await homePage.skipLink.root.boundingBox()

    expect(box).not.toBeNull()
    expect(box?.height).toBeGreaterThan(16)
    expect(box?.width).toBeGreaterThan(32)

    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()
    await expect(homePage.main).toHaveRole('main')
    await expect(homePage.main).toHaveAttribute('tabindex', '-1')

    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')

    await homePage.skipLink.tabTo()
    await expect(homePage.skipLink.root).toBeFocused()
    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()
  })
})
