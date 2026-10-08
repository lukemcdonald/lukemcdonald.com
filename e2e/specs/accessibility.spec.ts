import { expect, test } from '../fixtures'
import { summarizeViolations } from '../helpers/a11y'
import { ROUTES, THEMES } from '../routes'

test.describe('accessibility', { tag: '@a11y' }, () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route.id} has no WCAG A/AA violations in ${theme} mode`, async ({
        makeAxeBuilder,
        sitePage,
      }, testInfo) => {
        await sitePage.goto({ path: route.path, theme })

        const results = await makeAxeBuilder().analyze()

        if (results.violations.length > 0) {
          await testInfo.attach('accessibility-scan-results', {
            body: JSON.stringify(results, null, 2),
            contentType: 'application/json',
          })
        }

        expect(summarizeViolations(results.violations)).toEqual([])
      })
    }
  }
})
