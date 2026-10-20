import { expect, test } from '../fixtures'

test.describe('webmcp', { tag: '@desktop' }, () => {
  test('loads without page errors when WebMCP is absent', async ({ homePage, page }) => {
    const errors: string[] = []

    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await homePage.goto()
    await expect(homePage.main).toBeVisible()
    expect(errors).toEqual([])
  })
})
