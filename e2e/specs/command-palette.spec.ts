import { commandPalettePageTestId } from '../constants'
import { expect, test } from '../fixtures'

test.describe('command palette', { tag: ['@desktop', '@smoke'] }, () => {
  test('opens from the keyboard and toggles closed', async ({ homePage }) => {
    await homePage.goto()
    await expect(homePage.header.commandPalette.trigger).toBeVisible()
    await homePage.header.commandPalette.openWithKeyboard()

    await expect(homePage.header.commandPalette.dialog).toBeVisible()
    await expect(homePage.header.commandPalette.input).toBeFocused()

    await homePage.page.keyboard.press('ControlOrMeta+k')
    await expect(homePage.header.commandPalette.dialog).toBeHidden()
  })

  test('hides unmatched pages and empty groups while filtering', async ({ homePage }) => {
    const palette = homePage.header.commandPalette
    const work = palette.navGroup('Work')
    const play = palette.navGroup('Play')
    const live = palette.navGroup('Live')

    await homePage.goto()
    await palette.openWithKeyboard()
    await palette.input.fill('ced')

    await expect(work.getByTestId(commandPalettePageTestId('/work/cedaro'))).toBeVisible()
    await expect(work.getByTestId(commandPalettePageTestId('/resume'))).toBeHidden()
    await expect(play).toBeHidden()
    await expect(live).toBeHidden()
  })

  test('font options move with arrow keys and apply the selection', async ({ homePage }) => {
    const fontToggle = homePage.header.commandPalette.fontToggle

    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await fontToggle.root.click()
    await expect(fontToggle.option('work')).toBeFocused()

    await homePage.page.keyboard.press('Enter')
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')

    await fontToggle.root.click()
    await expect(fontToggle.option('work')).toBeFocused()

    await homePage.page.keyboard.press('ArrowDown')
    await expect(fontToggle.option('play')).toBeFocused()

    await fontToggle.option('live').click()
    await expect.poll(() => homePage.storedFontPairing()).toBe('live')
  })

  test('appearance options move with arrow keys', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await homePage.header.commandPalette.themeToggle.root.click()
    await expect(homePage.header.commandPalette.themeToggle.option('system')).toBeFocused()

    await homePage.page.keyboard.press('ArrowDown')
    await expect(homePage.header.commandPalette.themeToggle.option('light')).toBeFocused()

    await homePage.page.keyboard.press('Enter')
    await expect.poll(() => homePage.storedThemeMode()).toBe('light')
  })

  test('closes when the backdrop is clicked', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await expect(homePage.header.commandPalette.dialog).toBeVisible()

    await homePage.header.commandPalette.input.click()
    await expect(homePage.header.commandPalette.dialog).toBeVisible()

    await homePage.header.commandPalette.closeWithBackdropClick()
    await expect(homePage.header.commandPalette.dialog).toBeHidden()
  })

  test('lists a found egg on the Secrets page from the shortcut', async ({ homePage }) => {
    const palette = homePage.header.commandPalette
    const aurora = palette.egg('aurora')

    await homePage.goto()
    await palette.markEggFound('aurora')
    await palette.openWithKeyboard()
    await palette.openSecretsWithKeyboard()

    await expect(aurora).toBeVisible()
    await aurora.click()
    await expect(aurora).toHaveAttribute('aria-checked', 'true')
  })
})
