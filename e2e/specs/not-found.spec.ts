import { TEST_ID } from '../constants'
import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test('shows the 404 title and a verse loading placeholder', async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.pageTitle).toHaveText('404.')
    await expect(sitePage.page.getByTestId(TEST_ID.verseSkeleton)).toBeVisible()
    await expect(sitePage.page.getByTestId(TEST_ID.verse)).toHaveCount(0)
  })
})
