import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test("shows the original error copy and today's verse", async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.page.getByRole('heading', { level: 1 })).toHaveText('404.')
    await expect(
      sitePage.page.getByText('The page you are looking for does not exist.'),
    ).toBeVisible()
    await expect(sitePage.page.locator('blockquote')).toContainText(/.+/)
    await expect(sitePage.page.locator('blockquote a')).toHaveAttribute(
      'href',
      /https:\/\/www\.bible\.com\/bible\/3034\//,
    )
  })
})
