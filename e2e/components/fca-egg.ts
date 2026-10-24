import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'

export class FcaEgg {
  readonly close
  readonly dialog
  readonly iframe
  readonly page: Page

  constructor(page: Page) {
    this.close = page.getByTestId(TEST_ID.fcaEggClose)
    this.dialog = page.getByTestId(TEST_ID.fcaEggDialog)
    this.iframe = page.getByTestId(TEST_ID.fcaEggIframe)
    this.page = page
  }

  async closeWithKeyboard() {
    await this.close.focus()
    await this.page.keyboard.press('Escape')
    await this.iframe.waitFor({ state: 'detached' })
  }

  async trigger() {
    await this.page.keyboard.type('fca')
    await this.dialog.waitFor({ state: 'visible' })
  }
}
