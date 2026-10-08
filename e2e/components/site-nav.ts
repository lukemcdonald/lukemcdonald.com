import type { Page } from '@playwright/test'

import { navLinkTestId, navMenuTestId, TEST_ID } from '../constants'

export class SiteNav {
  readonly mobileAppearance
  readonly mobileMenuTrigger
  readonly page: Page
  readonly resumeLink
  readonly root
  readonly workMenuTrigger

  constructor(page: Page) {
    this.mobileAppearance = page.getByTestId(TEST_ID.mobileAppearance)
    this.mobileMenuTrigger = page.getByTestId(TEST_ID.mobileMenuTrigger)
    this.page = page
    this.resumeLink = page.getByTestId(navLinkTestId('/resume')).filter({ visible: true })
    this.root = page.getByTestId(TEST_ID.siteNav)
    this.workMenuTrigger = page.getByTestId(navMenuTestId('Work'))
  }

  async closeMobileMenu() {
    await this.page.keyboard.press('Escape')
  }

  async openMobileMenu() {
    await this.mobileMenuTrigger.click()
  }

  async openWorkMenu() {
    await this.workMenuTrigger.click()
  }
}
