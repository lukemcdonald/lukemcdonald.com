import type { Page } from '@playwright/test'

import { BasePage } from './base.page'

export class ResumePage extends BasePage {
  constructor(page: Page) {
    super(page, '/resume')
  }
}
