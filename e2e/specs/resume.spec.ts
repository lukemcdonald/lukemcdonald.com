import { MCP_URL } from '../../src/features/mcp/mcp.constants'
import { expect, test } from '../fixtures'

test.describe('resume MCP callout', { tag: '@smoke' }, () => {
  test('shows the MCP URL and copies it from the button', async ({ isMobile, resumePage }) => {
    await resumePage.goto()

    await expect(resumePage.callout).toBeVisible()
    await expect(resumePage.mcpUrl).toHaveText(MCP_URL)
    await expect(resumePage.mcpUrl).toHaveAttribute('href', '/mcp')
    await expect(resumePage.copyButton).toHaveRole('button')
    await expect(resumePage.copyButton).toHaveAccessibleName('Copy MCP URL')
    await expect(resumePage.copyButton).toBeVisible()

    if (!isMobile) {
      await resumePage.page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    }

    await resumePage.copyButton.click()

    await expect(resumePage.copyButton).toHaveText('Copied')
    await expect(resumePage.copyButton).toHaveAccessibleName('Copied MCP URL')
    await expect(resumePage.copyStatus).toHaveText('Copied')

    if (!isMobile) {
      await expect
        .poll(() => {
          return resumePage.page.evaluate(() => {
            return navigator.clipboard.readText()
          })
        })
        .toBe(MCP_URL)
    }
  })

  test('copy button is usable with the keyboard', async ({ resumePage }) => {
    await resumePage.goto()
    await resumePage.copyButton.focus()

    await expect(resumePage.copyButton).toBeFocused()

    await resumePage.page.keyboard.press('Enter')

    await expect(resumePage.copyButton).toHaveText('Copied')
    await expect(resumePage.copyStatus).toHaveText('Copied')
  })
})
