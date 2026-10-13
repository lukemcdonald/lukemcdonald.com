import type { Page } from '@playwright/test'

import { glassOptionTestId, TEST_ID } from '../constants'

export class GlassToggle {
  readonly page: Page
  readonly root

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId(TEST_ID.glassToggle)
  }

  option(level: string) {
    return this.page.getByTestId(glassOptionTestId(level))
  }

  async select(level: string) {
    await this.root.click()
    await this.option(level).click()
  }
}
