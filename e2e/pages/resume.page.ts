import type { SiteTheme } from '../routes'
import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'
import { BasePage } from './base.page'

export class ResumePage extends BasePage {
  readonly callout
  readonly copyButton
  readonly copyStatus
  readonly mcpUrl

  constructor(page: Page) {
    super(page, '/resume')
    this.callout = page.getByTestId(TEST_ID.resumeMcpCallout)
    this.copyButton = page.getByTestId(TEST_ID.resumeMcpCopy)
    this.copyStatus = page.getByTestId(TEST_ID.resumeMcpCopyStatus)
    this.mcpUrl = page.getByTestId(TEST_ID.resumeMcpUrl)
  }

  override async goto(options: { path?: string; theme?: SiteTheme } = {}) {
    await this.page.addInitScript(() => {
      let value = ''

      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          readText() {
            return Promise.resolve(value)
          },
          writeText(text: string) {
            value = text
            return Promise.resolve()
          },
        },
      })
    })

    await super.goto(options)
  }
}
