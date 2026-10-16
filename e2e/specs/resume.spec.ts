import { MCP_URL } from '../../src/features/mcp/mcp.constants'
import { expect, test } from '../fixtures'

test.describe('resume MCP callout', { tag: '@smoke' }, () => {
  test('shows the MCP URL as plain text and copies it from the button', async ({ resumePage }) => {
    await resumePage.goto()

    await expect(resumePage.callout).toBeVisible()
    await expect(resumePage.mcpUrl).toHaveText(MCP_URL)
    await expect(resumePage.mcpUrl).not.toHaveAttribute('href')
    await expect(resumePage.copyButton).toHaveRole('button')
    await expect(resumePage.copyButton).toHaveAccessibleName('Copy MCP URL')
    await expect(resumePage.copyButton).toBeVisible()

    await resumePage.copyButton.click()

    await expect(resumePage.copyButton).toHaveAccessibleName('Copied MCP URL')
    await expect(resumePage.copyStatus).toHaveText('Copied')
    await expect(resumePage.copyStatus).toBeVisible()
    await expect
      .poll(() => {
        return resumePage.page.evaluate(() => {
          return navigator.clipboard.readText()
        })
      })
      .toBe(MCP_URL)
  })

  test('copy button is usable with the keyboard', async ({ resumePage }) => {
    await resumePage.goto()
    await resumePage.copyButton.focus()

    await expect(resumePage.copyButton).toBeFocused()

    await resumePage.copyButton.press('Enter')

    await expect(resumePage.copyButton).toHaveAccessibleName('Copied MCP URL')
    await expect(resumePage.copyStatus).toHaveText('Copied')
    await expect(resumePage.copyStatus).toBeVisible()
  })

  test('is hidden in print media', async ({ resumePage }) => {
    await resumePage.goto()
    await expect(resumePage.callout).toBeVisible()

    await resumePage.page.emulateMedia({ media: 'print' })

    await expect(resumePage.callout).toBeHidden()
  })
})
