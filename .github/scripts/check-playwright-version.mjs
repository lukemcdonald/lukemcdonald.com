import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const expected = process.argv[2]
const installed = require('@playwright/test/package.json').version

if (!expected) {
  console.error('Usage: node .github/scripts/check-playwright-version.mjs <expected-version>')
  process.exit(2)
}

if (installed !== expected) {
  console.error(
    `Installed @playwright/test ${installed} does not match mcr.microsoft.com/playwright:v${expected}-noble.`,
  )
  console.error(
    `Update the e2e job container image to mcr.microsoft.com/playwright:v${installed}-noble.`,
  )
  process.exit(1)
}

console.log(`@playwright/test ${installed} matches mcr.microsoft.com/playwright:v${expected}-noble.`)
