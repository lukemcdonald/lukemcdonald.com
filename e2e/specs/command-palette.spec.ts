import { expect, test } from '../fixtures'

test.describe('command palette', { tag: ['@desktop', '@smoke'] }, () => {
  test('opens from the keyboard with a named search field and toggles closed', async ({
    homePage,
  }) => {
    await homePage.goto()
    await expect(homePage.header.commandPalette.trigger).toBeVisible()
    await homePage.header.commandPalette.openWithKeyboard()

    await expect(homePage.header.commandPalette.dialog).toBeVisible()
    await expect(homePage.header.commandPalette.input).toBeFocused()
    await expect(homePage.header.commandPalette.input).toHaveAccessibleName('Search')

    await homePage.page.keyboard.press('ControlOrMeta+k')
    await expect(homePage.header.commandPalette.dialog).toBeHidden()
  })
})
