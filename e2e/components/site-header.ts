import type { Page } from '@playwright/test'

import { TEST_ID } from '../constants'
import { CommandPalette } from './command-palette'
import { SiteNav } from './site-nav'

export class SiteHeader {
  readonly commandPalette: CommandPalette
  readonly homeLink
  readonly nav: SiteNav
  readonly root

  constructor(page: Page) {
    this.commandPalette = new CommandPalette(page)
    this.homeLink = page.getByTestId(TEST_ID.siteHomeLink)
    this.nav = new SiteNav(page)
    this.root = page.getByTestId(TEST_ID.siteHeader)
  }
}
