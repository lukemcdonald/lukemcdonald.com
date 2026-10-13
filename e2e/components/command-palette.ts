import type { Page } from '@playwright/test'

import { commandPaletteEggTestId, EASTER_EGGS_FOUND_KEY, TEST_ID } from '../constants'
import { ThemeToggle } from './theme-toggle'

export class CommandPalette {
  readonly crumb
  readonly dialog
  readonly highlightedSecrets
  readonly host
  readonly input
  readonly page: Page
  readonly secrets
  readonly secretsFooter
  readonly themeToggle: ThemeToggle
  readonly trigger

  constructor(page: Page) {
    this.crumb = page.getByTestId(TEST_ID.commandPaletteCrumb)
    this.dialog = page.getByTestId(TEST_ID.commandPalette)
    this.highlightedSecrets = page
      .getByTestId(TEST_ID.commandPaletteSecrets)
      .locator('[data-palette-highlighted]')
    this.host = page.getByTestId(TEST_ID.commandPaletteDialog)
    this.input = page.getByTestId(TEST_ID.commandPaletteInput)
    this.page = page
    this.secrets = page.getByTestId(TEST_ID.commandPaletteSecrets)
    this.secretsFooter = page.getByTestId(TEST_ID.commandPaletteSecretsFooter)
    this.themeToggle = new ThemeToggle(page)
    this.trigger = page.getByTestId(TEST_ID.commandPaletteTrigger)
  }

  async closeWithBackdropClick() {
    await this.host.click({ position: { x: 8, y: 8 } })
    await this.input.waitFor({ state: 'hidden' })
  }

  async closeWithKeyboard() {
    await this.page.keyboard.press('Escape')
    await this.input.waitFor({ state: 'hidden' })
  }

  egg(id: string) {
    return this.page.getByTestId(commandPaletteEggTestId(id))
  }

  async markEggFound(...ids: string[]) {
    await this.page.evaluate(
      ({ eggIds, key }) => {
        localStorage.setItem(key, JSON.stringify(eggIds))
      },
      { eggIds: ids, key: EASTER_EGGS_FOUND_KEY },
    )
  }

  async openSecretsWithKeyboard() {
    await this.page.keyboard.press('ControlOrMeta+.')
    await this.secrets.waitFor({ state: 'visible' })
  }

  async openWithKeyboard() {
    await this.page.keyboard.press('ControlOrMeta+k')
    await this.input.waitFor({ state: 'visible' })
  }
}
