import { expect, test } from '../fixtures'

test.describe('not found', { tag: '@smoke' }, () => {
  test("shows a way home and today's verse", async ({ sitePage }) => {
    await sitePage.goto({ path: '/missing-page' })

    await expect(sitePage.page.getByRole('heading', { level: 1 })).toHaveText(
      "You're lost, but here's something true.",
    )
    await expect(
      sitePage.page.getByText('Your word is a lamp to my feet and a light to my path.'),
    ).toBeVisible()
    await expect(sitePage.page.getByRole('link', { name: 'Psalm 119:105' })).toHaveAttribute(
      'href',
      'https://www.bible.com/bible/3034/PSA.119.105.BSB',
    )

    await sitePage.page.getByRole('link', { name: 'Head home' }).click()
    await sitePage.waitForPath('/')
  })
})
