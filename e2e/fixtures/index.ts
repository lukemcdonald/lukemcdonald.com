import AxeBuilder from '@axe-core/playwright'
import { test as base } from '@playwright/test'

import { CommandPalette } from '../components/command-palette'
import { SiteHeader } from '../components/site-header'
import { SiteNav } from '../components/site-nav'
import { SkipLink } from '../components/skip-link'
import { ThemeToggle } from '../components/theme-toggle'
import { WCAG_TAGS } from '../constants'
import { BasePage } from '../pages/base.page'
import { HomePage } from '../pages/home.page'

type Fixtures = {
  commandPalette: CommandPalette
  homePage: HomePage
  makeAxeBuilder: () => AxeBuilder
  siteHeader: SiteHeader
  siteNav: SiteNav
  sitePage: BasePage
  skipLink: SkipLink
  themeToggle: ThemeToggle
}

export const test = base.extend<Fixtures>({
  commandPalette: async ({ page }, use) => {
    await use(new CommandPalette(page))
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => {
      return new AxeBuilder({ page }).withTags([...WCAG_TAGS])
    }

    await use(makeAxeBuilder)
  },
  siteHeader: async ({ page }, use) => {
    await use(new SiteHeader(page))
  },
  siteNav: async ({ page }, use) => {
    await use(new SiteNav(page))
  },
  sitePage: async ({ page }, use) => {
    await use(new BasePage(page))
  },
  skipLink: async ({ page }, use) => {
    await use(new SkipLink(page))
  },
  themeToggle: async ({ page }, use) => {
    await use(new ThemeToggle(page))
  },
})

export { expect } from '@playwright/test'
