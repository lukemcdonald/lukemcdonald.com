import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test("shows the original error copy and today's verse", async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.page.getByRole('heading', { level: 1 })).toHaveText('404.')
    await expect(sitePage.page.getByText('Error', { exact: true })).toBeVisible()
    await expect(sitePage.page.getByText("Page not found. Here's a verse.")).toBeVisible()
    await expect(sitePage.page.getByText('Verse of the day', { exact: true })).toHaveCount(0)
    await expect(sitePage.page.locator('blockquote')).toContainText(/.+/)
    await expect(sitePage.page.getByRole('link', { name: /^— / })).toHaveAttribute(
      'href',
      /https:\/\/www\.bible\.com\/bible\/3034\//,
    )
  })
})
