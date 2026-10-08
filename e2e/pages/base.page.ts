import type { SiteTheme } from '../routes'
import type { Page } from '@playwright/test'

import { SiteHeader } from '../components/site-header'
import { SkipLink } from '../components/skip-link'
import { TEST_ID, THEME_MODE_STORAGE_KEY, THEME_SEED_LOCK_KEY } from '../constants'

export class BasePage {
  readonly header: SiteHeader
  readonly main
  readonly page: Page
  readonly path: string
  readonly skipLink: SkipLink

  constructor(page: Page, path = '/') {
    this.header = new SiteHeader(page)
    this.main = page.getByTestId(TEST_ID.main)
    this.page = page
    this.path = path
    this.skipLink = new SkipLink(page)
  }

  async goto(options: { path?: string; theme?: SiteTheme } = {}) {
    const path = options.path ?? this.path

    if (options.theme) {
      await this.page.addInitScript(
        ({ key, lockKey, theme }) => {
          if (sessionStorage.getItem(lockKey)) {
            return
          }

          localStorage.setItem(key, theme)
          sessionStorage.setItem(lockKey, '1')
        },
        { key: THEME_MODE_STORAGE_KEY, lockKey: THEME_SEED_LOCK_KEY, theme: options.theme },
      )
    }

    await this.page.goto(path)
    await this.main.waitFor({ state: 'visible' })
  }

  async isDarkMode() {
    return this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark')
    })
  }

  async markClientRouter() {
    await this.page.evaluate(() => {
      Object.assign(window, { __e2eClientRouter: true })
    })
  }

  async storedThemeMode() {
    return this.page.evaluate((key) => {
      return localStorage.getItem(key)
    }, THEME_MODE_STORAGE_KEY)
  }

  async waitForPath(path: string) {
    await this.page.waitForURL(path)
    await this.main.waitFor({ state: 'visible' })
    await this.page.waitForFunction(() => {
      return !document.documentElement.hasAttribute('data-astro-transition')
    })
  }

  async wasClientRouterPreserved() {
    return this.page.evaluate(() => {
      return Object.prototype.hasOwnProperty.call(window, '__e2eClientRouter')
    })
  }
}
