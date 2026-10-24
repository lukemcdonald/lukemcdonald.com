import { expect, test } from '../fixtures'

test.describe('fca easter egg', () => {
  test('opens the video lightbox from the code and unloads it on close', async ({ homePage }) => {
    const egg = homePage.fcaEgg

    await homePage.goto()
    await expect(egg.iframe).toHaveCount(0)

    await egg.trigger()
    await expect(egg.dialog).toBeVisible()
    await expect(egg.iframe).toBeVisible()
    await expect(egg.iframe).toHaveAttribute('src', /wM0if-w6PEs/)

    await egg.closeWithKeyboard()
    await expect(egg.iframe).toHaveCount(0)
    await expect(egg.dialog).toBeHidden()

    await homePage.page.reload()
    await homePage.main.waitFor({ state: 'visible' })
    await expect(egg.dialog).toBeHidden()
    await expect(egg.iframe).toHaveCount(0)
  })

  test(
    'marks the secret found in the command palette',
    { tag: '@desktop' },
    async ({ homePage }) => {
      const palette = homePage.header.commandPalette

      await homePage.goto()
      await homePage.fcaEgg.trigger()
      await homePage.fcaEgg.closeWithKeyboard()
      await palette.openWithKeyboard()
      await palette.openSecretsWithKeyboard()

      await expect(palette.egg('fca')).toBeVisible()
    },
  )
})
