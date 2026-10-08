import type { Page } from '@playwright/test'

import { navMenuTestId, TEST_ID } from '../constants'

export class SiteNav {
  readonly mobileAppearance
  readonly mobileMenuTrigger
  readonly page: Page
  readonly root
  readonly workMenuTrigger

  constructor(page: Page) {
    const desktopNav = page.getByTestId(TEST_ID.desktopNav)
    const mobileMenu = page.getByTestId(TEST_ID.mobileMenu)

    this.mobileAppearance = mobileMenu.getByTestId(TEST_ID.mobileAppearance)
    this.mobileMenuTrigger = mobileMenu.getByTestId(TEST_ID.mobileMenuTrigger)
    this.page = page
    this.root = page.getByTestId(TEST_ID.siteNav)
    this.workMenuTrigger = desktopNav.getByTestId(navMenuTestId('Work'))
  }

  async closeMobileMenu() {
    await this.page.keyboard.press('Escape')
    await this.mobileAppearance.waitFor({ state: 'hidden' })
  }

  async openMobileMenu() {
    await this.mobileMenuTrigger.click()
    await this.mobileAppearance.waitFor({ state: 'visible' })
  }
}
