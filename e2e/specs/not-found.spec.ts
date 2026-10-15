import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test("shows a way home and today's verse", async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.page.getByRole('heading', { level: 1 })).toHaveText(
      "You're lost, but here's something true.",
    )
    await expect(sitePage.page.locator('blockquote')).toBeVisible()
    await expect(sitePage.page.locator('blockquote cite a')).toHaveAttribute(
      'href',
      /https:\/\/www\.bible\.com\/bible\/3034\//,
    )

    await sitePage.page.getByRole('link', { name: 'Head home' }).click()
    await sitePage.waitForPath('/')
  })
})
