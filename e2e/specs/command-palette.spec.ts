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

  test('filters pages and opens a match with enter', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await homePage.header.commandPalette.input.fill('resume')

    await expect(homePage.header.commandPalette.item('/resume')).toBeVisible()
    await expect(homePage.header.commandPalette.item('/tread-talks')).toBeHidden()

    await homePage.page.keyboard.press('Enter')
    await homePage.waitForPath('/resume')
  })

  test('opens the secrets page from the footer and returns on escape', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()

    await expect(homePage.header.commandPalette.secretsFooter).toBeVisible()
    await homePage.header.commandPalette.openSecrets()
    await expect(homePage.header.commandPalette.secretsFooter).toBeHidden()
    await expect(homePage.header.commandPalette.input).toBeFocused()

    await homePage.page.keyboard.press('Escape')
    await expect(homePage.header.commandPalette.secrets).toBeHidden()
    await expect(homePage.header.commandPalette.dialog).toBeVisible()
    await expect(homePage.header.commandPalette.input).toBeFocused()
  })
})
