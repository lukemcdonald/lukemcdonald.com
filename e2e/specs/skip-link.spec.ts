import { expect, test } from '../fixtures'
import { readBox, readFocusRing } from '../helpers/focus'

test.describe('skip link', { tag: '@a11y' }, () => {
  test('is the first tab stop, becomes visible and fixed on focus, and moves focus to main', async ({
    homePage,
  }) => {
    await homePage.goto()
    await homePage.skipLink.tabTo()

    await expect(homePage.skipLink.root).toBeFocused()
    await expect(homePage.skipLink.root).toHaveRole('link')
    await expect(homePage.skipLink.root).toHaveAccessibleName('Skip to content')

    const box = await readBox(homePage.skipLink.root)
    const ring = await readFocusRing(homePage.skipLink.root)

    expect(box.height).toBeGreaterThan(0)
    expect(box.width).toBeGreaterThan(0)
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(ring.position).toBe('fixed')

    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()
    await expect(homePage.main).toHaveRole('main')
    await expect(homePage.main).toHaveAttribute('tabindex', '-1')
  })

  test('still moves focus to main after ClientRouter navigation', async ({ homePage }) => {
    await homePage.goto()
    await homePage.greetingLink('/i-am-a/christian').click()
    await homePage.waitForPath('/i-am-a/christian')

    await homePage.skipLink.tabTo()
    await expect(homePage.skipLink.root).toBeFocused()

    const box = await readBox(homePage.skipLink.root)
    const ring = await readFocusRing(homePage.skipLink.root)

    expect(box.height).toBeGreaterThan(0)
    expect(box.width).toBeGreaterThan(0)
    expect(ring.position).toBe('fixed')

    await homePage.skipLink.activate()
    await expect(homePage.main).toBeFocused()
  })
})
