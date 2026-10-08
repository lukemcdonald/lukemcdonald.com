import type { Page } from '@playwright/test'

import { TEST_ID, themeOptionTestId } from '../constants'

export class ThemeToggle {
  readonly page: Page
  readonly root

  constructor(page: Page) {
    this.page = page
    this.root = page.getByTestId(TEST_ID.themeToggle)
  }

  option(mode: 'dark' | 'light' | 'system') {
    return this.page.getByTestId(themeOptionTestId(mode))
  }

  async select(mode: 'dark' | 'light' | 'system') {
    await this.root.click()
    await this.option(mode).click()
  }
}
