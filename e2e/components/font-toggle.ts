import type { Page } from '@playwright/test'

import { fontOptionTestId, TEST_ID } from '../constants'

export class FontToggle {
  readonly page: Page
  readonly root

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId(TEST_ID.fontToggle)
  }

  option(pairing: string) {
    return this.page.getByTestId(fontOptionTestId(pairing))
  }

  async select(pairing: string) {
    await this.root.click()
    await this.option(pairing).click()
  }
}
