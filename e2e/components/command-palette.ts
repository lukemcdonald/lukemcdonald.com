import type { Page } from '@playwright/test'

import { STORAGE_KEYS } from '../../src/utils/storage'
import { commandPaletteEggTestId, commandPaletteNavGroupTestId, TEST_ID } from '../constants'
import { FontToggle } from './font-toggle'
import { ThemeToggle } from './theme-toggle'

export class CommandPalette {
  readonly dialog
  readonly fontToggle: FontToggle
  readonly host
  readonly input
  readonly page: Page
  readonly secrets
  readonly themeToggle: ThemeToggle
  readonly trigger

  constructor(page: Page) {
    this.dialog = page.getByTestId(TEST_ID.commandPalette)
    this.fontToggle = new FontToggle(page)
    this.host = page.getByTestId(TEST_ID.commandPaletteDialog)
    this.input = page.getByTestId(TEST_ID.commandPaletteInput)
    this.page = page
    this.secrets = page.getByTestId(TEST_ID.commandPaletteSecrets)
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
      { eggIds: ids, key: STORAGE_KEYS.easterEggFound },
    )
  }

  navGroup(name: string) {
    return this.page.getByTestId(commandPaletteNavGroupTestId(name))
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
