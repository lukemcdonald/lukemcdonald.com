import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'

export class TeamEgg {
  readonly close
  readonly dialog
  readonly iframe
  readonly page: Page

  constructor(page: Page) {
    this.close = page.getByTestId(TEST_ID.teamEggClose)
    this.dialog = page.getByTestId(TEST_ID.teamEggDialog)
    this.iframe = page.getByTestId(TEST_ID.teamEggIframe)
    this.page = page
  }

  async closeWithKeyboard() {
    await this.close.focus()
    await this.page.keyboard.press('Escape')
    await this.iframe.waitFor({ state: 'detached' })
  }

  async trigger() {
    await this.page.keyboard.type('team')
    await this.dialog.waitFor({ state: 'visible' })
  }
}
