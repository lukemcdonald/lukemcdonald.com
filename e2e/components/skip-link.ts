import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'

export class SkipLink {
  readonly page: Page
  readonly root

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId(TEST_ID.skipLink)
  }

  async activate() {
    await this.root.press('Enter')
  }

  async tabTo() {
    await this.page.evaluate(() => {
      const active = document.activeElement

      if (active instanceof HTMLElement) {
        active.blur()
      }
    })
    await this.page.keyboard.press('Tab')
  }
}
