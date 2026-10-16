import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test('shows the original error copy and a verse loading placeholder', async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.page.getByRole('heading', { level: 1 })).toHaveText('404.')
    await expect(sitePage.page.getByText('Error', { exact: true })).toBeVisible()
    await expect(sitePage.page.getByText('Page not found.')).toBeVisible()
    await expect(sitePage.page.getByText('Loading verse')).toHaveCount(1)
    await expect(sitePage.page.getByText('Your word is a lamp to my feet')).toHaveCount(0)
    await expect(sitePage.page.getByText('Verse of the day', { exact: true })).toHaveCount(0)
  })
})
