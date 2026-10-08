import { expect, test } from '../fixtures'

test.describe('command palette', { tag: '@smoke' }, () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'Command palette hydrates only for hover-capable pointers')
  })

  test('opens and closes from the keyboard with focus on the search field', async ({
    homePage,
  }) => {
    await homePage.goto()
    await expect(homePage.header.commandPalette.trigger).toBeVisible()
    await homePage.header.commandPalette.openWithKeyboard()

    await expect(homePage.header.commandPalette.dialog).toBeVisible()
    await expect(homePage.header.commandPalette.input).toBeFocused()

    await homePage.header.commandPalette.closeWithKeyboard()
    await expect(homePage.header.commandPalette.dialog).toBeHidden()
    await expect(homePage.header.commandPalette.input).toBeHidden()
  })

  test('toggles closed when the shortcut is pressed again', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await expect(homePage.header.commandPalette.dialog).toBeVisible()

    await homePage.page.keyboard.press('ControlOrMeta+k')
    await expect(homePage.header.commandPalette.dialog).toBeHidden()
  })
})
