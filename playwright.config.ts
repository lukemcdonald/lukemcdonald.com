import { defineConfig, devices } from '@playwright/test'

const e2eBrowsers = process.env.E2E_BROWSERS === 'full' ? 'full' : 'pr'
const e2ePort = process.env.E2E_PORT || '4173'
const baseURL = `http://127.0.0.1:${e2ePort}`
const isCI = Boolean(process.env.CI)

const chromiumProject = {
  name: 'chromium',
  use: { ...devices['Desktop Chrome'] },
}

const firefoxProject = {
  grepInvert: /@axe/,
  name: 'firefox',
  use: { ...devices['Desktop Firefox'] },
}

const webkitProject = {
  grepInvert: /@axe/,
  name: 'webkit',
  use: { ...devices['Desktop Safari'] },
}

const mobileProject = {
  grepInvert: /@axe|@desktop/,
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },
}

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: true,
  globalTimeout: 60 * 60 * 1000,
  outputDir: 'test-results',
  projects:
    e2eBrowsers === 'full' ?
      [chromiumProject, firefoxProject, webkitProject, mobileProject]
    : [chromiumProject, mobileProject],
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'on-failure' }]],
  retries: isCI ? 1 : 0,
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    testIdAttribute: 'data-testid',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm preview:static',
    reuseExistingServer: !isCI,
    timeout: 180 * 1000,
    url: baseURL,
  },
  workers: isCI ? 1 : undefined,
})
