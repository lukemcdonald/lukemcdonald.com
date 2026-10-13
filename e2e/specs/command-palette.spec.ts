import type { Locator } from '@playwright/test'

import { expect, test } from '../fixtures'

async function expectHoverHighlightOnly(hovered: Locator, selected: Locator, idle: Locator) {
  await hovered.hover()
  await expect.poll(async () => optionBackground(selected)).toBe(await optionBackground(idle))
  await expect
    .poll(async () => optionBackground(hovered))
    .not.toBe(await optionBackground(selected))
}

async function expectPickerOptionChrome(option: Locator) {
  const check = await option.locator('svg').first().boundingBox()
  const label = await option.locator('span').boundingBox()
  const height = await optionHeight(option)

  expect(check?.x).toBeLessThan(label?.x ?? 0)
  expect(height).toBeGreaterThanOrEqual(32)
  expect(height).toBeLessThanOrEqual(36)
}

async function optionBackground(locator: Locator) {
  return locator.evaluate((el) => {
    return getComputedStyle(el).backgroundColor
  })
}

async function optionHeight(locator: Locator) {
  return locator.evaluate((el) => {
    return el.getBoundingClientRect().height
  })
}

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

  test('arrow keys expose the active command to assistive tech', async ({ homePage }) => {
    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()

    const input = homePage.header.commandPalette.input

    await expect(input).toHaveRole('combobox')
    await homePage.page.keyboard.press('ArrowDown')

    const activeId = await input.getAttribute('aria-activedescendant')

    expect(activeId).toBeTruthy()

    const activeOption = homePage.page.locator(`[id="${activeId}"]`)

    await expect(activeOption).toHaveRole('option')
    await expect(activeOption).toHaveAttribute('aria-selected', 'true')
  })

  test('font options keep the check on the selection and move highlight with focus', async ({
    homePage,
  }) => {
    const fontToggle = homePage.header.commandPalette.fontToggle

    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await fontToggle.root.click()
    await expect(fontToggle.option('work')).toBeFocused()
    await expect(fontToggle.option('work')).not.toHaveAttribute('data-selected')

    await homePage.page.keyboard.press('Enter')
    await expect.poll(() => homePage.storedFontPairing()).toBe('work')

    await fontToggle.root.click()
    await expect(fontToggle.option('work')).toBeFocused()
    await expect(fontToggle.option('work')).toHaveAttribute('data-selected', '')

    await expectPickerOptionChrome(fontToggle.option('work'))

    await homePage.page.keyboard.press('ArrowDown')
    await expect(fontToggle.option('play')).toBeFocused()
    await expect(fontToggle.option('work')).toHaveAttribute('data-selected', '')
    await expect(fontToggle.option('play')).not.toHaveAttribute('data-selected')

    await fontToggle.option('live').click()
    await fontToggle.root.click()
    await expect(fontToggle.option('live')).toBeFocused()
    await expect(fontToggle.option('live')).toHaveAttribute('data-selected', '')
    await expectHoverHighlightOnly(
      fontToggle.option('work'),
      fontToggle.option('live'),
      fontToggle.option('play'),
    )
  })

  test('appearance options keep the check on the left and move with arrow keys', async ({
    homePage,
  }) => {
    const themeToggle = homePage.header.commandPalette.themeToggle

    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await themeToggle.root.click()
    await expect(themeToggle.option('system')).toBeFocused()

    await homePage.page.keyboard.press('ArrowDown')
    await expect(themeToggle.option('light')).toBeFocused()

    await homePage.page.keyboard.press('Enter')
    await expect.poll(() => homePage.storedThemeMode()).toBe('light')

    await themeToggle.root.click()
    await expect(themeToggle.option('light')).toHaveAttribute('data-selected', '')
    await expectPickerOptionChrome(themeToggle.option('light'))
    await expectHoverHighlightOnly(
      themeToggle.option('dark'),
      themeToggle.option('light'),
      themeToggle.option('system'),
    )
  })

  test('glass options share the picker row chrome', async ({ homePage }) => {
    const glassToggle = homePage.header.commandPalette.glassToggle

    await homePage.goto()
    await homePage.header.commandPalette.openWithKeyboard()
    await glassToggle.root.click()
    await expect(glassToggle.option('tinted')).toBeFocused()

    await glassToggle.option('solid').click()
    await expect.poll(() => homePage.storedGlassLevel()).toBe('solid')

    await glassToggle.root.click()
    await expect(glassToggle.option('solid')).toHaveAttribute('data-selected', '')
    await expectPickerOptionChrome(glassToggle.option('solid'))
    await expectHoverHighlightOnly(
      glassToggle.option('clear'),
      glassToggle.option('solid'),
      glassToggle.option('tinted'),
    )
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

  test('lists found eggs on the Secrets page from the shortcut', async ({ homePage }) => {
    const palette = homePage.header.commandPalette
    const aurora = palette.egg('aurora')

    await homePage.goto()
    await palette.markEggFound('aurora')
    await palette.openWithKeyboard()
    await expect(palette.secretsFooter).toContainText('Secrets 1/2')

    await expect.poll(async () => palette.listHeight()).toBeGreaterThan(150)

    const mainListHeight = await palette.listHeight()

    await palette.input.fill('zzzz-no-match')
    await expect(palette.list).toHaveCSS('overflow-y', 'auto')
    await expect.poll(async () => palette.listHeight()).toBeLessThan(mainListHeight)

    await palette.input.fill('')
    await palette.openSecretsWithKeyboard()
    await expect.poll(async () => palette.listHeight()).toBeLessThan(mainListHeight)
    await expect(palette.secretsFooter).toContainText('Back')
    await expect(palette.secretsFooter.locator('kbd')).toHaveText('esc')
    await expect(palette.secretsFooter.locator('button')).toHaveCount(0)
    await expect(aurora).toBeVisible()
    await expect(aurora).toHaveAttribute('aria-checked', 'false')
    await aurora.click()
    await expect(aurora).toHaveAttribute('aria-checked', 'true')

    await aurora.click()
    await expect(aurora).toHaveAttribute('aria-checked', 'false')
  })

  test('keeps secret labels aligned and highlights only the active item', async ({ homePage }) => {
    const palette = homePage.header.commandPalette
    const aurora = palette.egg('aurora')
    const hyrule = palette.egg('hyrule')

    await homePage.goto()
    await palette.markEggFound('aurora', 'hyrule')
    await palette.openWithKeyboard()
    await palette.openSecretsWithKeyboard()

    const auroraCheck = await aurora.locator('svg').boundingBox()
    const auroraLabel = await aurora.getByText('Aurora').boundingBox()
    const hyruleLabel = await hyrule.getByText('Hyrule').boundingBox()

    expect(auroraCheck?.x).toBeLessThan(auroraLabel?.x ?? 0)
    expect(auroraLabel?.x).toBe(hyruleLabel?.x)

    await homePage.page.keyboard.press('ArrowDown')
    await expect(palette.highlightedSecrets).toHaveCount(1)
    await expect(aurora).toHaveAttribute('data-palette-highlighted', '')

    await homePage.page.keyboard.press('Enter')
    await expect(aurora).toHaveAttribute('aria-checked', 'true')
    await expect(palette.highlightedSecrets).toHaveCount(1)

    await homePage.page.keyboard.press('ArrowDown')
    await expect(palette.highlightedSecrets).toHaveCount(1)
    await expect(hyrule).toHaveAttribute('data-palette-highlighted', '')
    await expect(aurora).not.toHaveAttribute('data-palette-highlighted')
    await expect(aurora).toHaveAttribute('aria-checked', 'true')
  })
})
