import type { Page } from '@playwright/test'

import { greetingLinkTestId } from '../constants'
import { BasePage } from './base.page'

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page, '/')
  }

  greetingLink(href: string) {
    return this.page.getByTestId(greetingLinkTestId(href))
  }
}
