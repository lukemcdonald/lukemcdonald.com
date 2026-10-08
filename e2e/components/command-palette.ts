import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'
import { ThemeToggle } from './theme-toggle'

export class CommandPalette {
  readonly dialog
  readonly input
  readonly page: Page
  readonly themeToggle: ThemeToggle
  readonly trigger

  constructor(page: Page) {
    this.dialog = page.getByTestId(TEST_ID.commandPalette)
    this.input = page.getByTestId(TEST_ID.commandPaletteInput)
    this.page = page
    this.themeToggle = new ThemeToggle(page)
    this.trigger = page.getByTestId(TEST_ID.commandPaletteTrigger)
  }

  async closeWithKeyboard() {
    await this.page.keyboard.press('Escape')
    await this.input.waitFor({ state: 'hidden' })
  }

  async openWithKeyboard() {
    await this.page.keyboard.press('ControlOrMeta+k')
    await this.input.waitFor({ state: 'visible' })
  }
}
