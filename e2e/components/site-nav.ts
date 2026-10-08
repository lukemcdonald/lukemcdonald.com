import type { Page } from '@playwright/test'

import { navLinkTestId, navMenuTestId, TEST_ID } from '../constants'

export class SiteNav {
  readonly desktopNav
  readonly liveMenuTrigger
  readonly mobileAppearance
  readonly mobileMenu
  readonly mobileMenuTrigger
  readonly page: Page
  readonly root
  readonly workMenuTrigger

  constructor(page: Page) {
    this.desktopNav = page.getByTestId(TEST_ID.desktopNav)
    this.liveMenuTrigger = this.desktopNav.getByTestId(navMenuTestId('Live'))
    this.mobileMenu = page.getByTestId(TEST_ID.mobileMenu)
    this.mobileAppearance = this.mobileMenu.getByTestId(TEST_ID.mobileAppearance)
    this.mobileMenuTrigger = this.mobileMenu.getByTestId(TEST_ID.mobileMenuTrigger)
    this.page = page
    this.root = page.getByTestId(TEST_ID.siteNav)
    this.workMenuTrigger = this.desktopNav.getByTestId(navMenuTestId('Work'))
  }

  async closeMobileMenu() {
    await this.page.keyboard.press('Escape')
    await this.mobileAppearance.waitFor({ state: 'hidden' })
  }

  desktopLink(href: string) {
    return this.desktopNav.getByTestId(navLinkTestId(href))
  }

  mobileLink(href: string) {
    return this.mobileMenu.getByTestId(navLinkTestId(href))
  }

  async openLiveMenu() {
    await this.liveMenuTrigger.click()
  }

  async openMobileMenu() {
    await this.mobileMenuTrigger.click()
    await this.mobileAppearance.waitFor({ state: 'visible' })
  }
}
