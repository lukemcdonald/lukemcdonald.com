import AxeBuilder from '@axe-core/playwright'
import { test as base } from '@playwright/test'

import { WCAG_TAGS } from '../constants'
import { BasePage } from '../pages/base.page'
import { HomePage } from '../pages/home.page'
import { ResumePage } from '../pages/resume.page'

type Fixtures = {
  homePage: HomePage
  makeAxeBuilder: () => AxeBuilder
  resumePage: ResumePage
  sitePage: BasePage
}

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => {
      return new AxeBuilder({ page }).withTags([...WCAG_TAGS])
    }

    await use(makeAxeBuilder)
  },
  resumePage: async ({ page }, use) => {
    await use(new ResumePage(page))
  },
  sitePage: async ({ page }, use) => {
    await use(new BasePage(page))
  },
})

export { expect } from '@playwright/test'
