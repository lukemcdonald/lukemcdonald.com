import type { Page } from '@playwright/test'

import { commandPaletteItemTestId, TEST_ID } from '../constants'
import { ThemeToggle } from './theme-toggle'

export class CommandPalette {
  readonly dialog
  readonly input
  readonly items
  readonly page: Page
  readonly secrets
  readonly secretsFooter
  readonly selectedItems
  readonly themeToggle: ThemeToggle
  readonly trigger

  constructor(page: Page) {
    this.dialog = page.getByTestId(TEST_ID.commandPalette)
    this.input = page.getByTestId(TEST_ID.commandPaletteInput)
    this.items = this.dialog.locator('[cmdk-item]')
    this.page = page
    this.secrets = page.getByTestId(TEST_ID.commandPaletteSecrets)
    this.secretsFooter = page.getByTestId(TEST_ID.commandPaletteSecretsFooter)
    this.selectedItems = this.dialog.locator('[cmdk-item][data-selected="true"]')
    this.themeToggle = new ThemeToggle(page)
    this.trigger = page.getByTestId(TEST_ID.commandPaletteTrigger)
  }

  async closeWithKeyboard() {
    await this.page.keyboard.press('Escape')
    await this.input.waitFor({ state: 'hidden' })
  }

  item(href: string) {
    return this.dialog.getByTestId(commandPaletteItemTestId(href))
  }

  async openSecrets() {
    await this.secretsFooter.click()
    await this.secrets.waitFor({ state: 'visible' })
  }

  async openWithKeyboard() {
    await this.page.keyboard.press('ControlOrMeta+k')
    await this.input.waitFor({ state: 'visible' })
  }
}
