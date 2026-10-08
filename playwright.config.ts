import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4321'
const isCI = Boolean(process.env.CI)

const desktopProjects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]

const mobileProject = {
  name: 'mobile-chrome',
  use: { ...devices['Pixel 5'] },
}

export default defineConfig({
  forbidOnly: isCI,
  fullyParallel: true,
  globalTimeout: 60 * 60 * 1000,
  outputDir: 'test-results',
  projects: isCI ? [...desktopProjects, mobileProject] : [desktopProjects[0], mobileProject],
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'on-failure' }]],
  retries: isCI ? 2 : 0,
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
