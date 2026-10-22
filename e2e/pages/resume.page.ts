import type { SiteTheme } from '../routes'
import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'
import { BasePage } from './base.page'

export class ResumePage extends BasePage {
  readonly copyButton
  readonly copyStatus
  readonly dismissButton
  readonly mcpUrl
  readonly toggle
  readonly widget

  constructor(page: Page) {
    super(page, '/resume')

    const widget = page.getByTestId(TEST_ID.resumeMcpWidget)

    this.copyButton = widget.getByRole('button', { name: 'Copy MCP URL' })
    this.copyStatus = widget.locator('[data-copy-status]')
    this.dismissButton = widget.getByTestId(TEST_ID.resumeMcpDismiss)
    this.mcpUrl = widget.getByTestId(TEST_ID.resumeMcpUrl)
    this.toggle = widget.getByTestId(TEST_ID.resumeMcpToggle)
    this.widget = widget
  }

  async expandIfCollapsed() {
    if (await this.toggle.isVisible()) {
      await this.toggle.click()
    }
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
