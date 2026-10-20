import { expect, test } from '../fixtures'

const TOOL_NAMES = [
  'find_secret',
  'list_secrets',
  'navigate_to_page',
  'set_font_pairing',
  'set_theme',
  'toggle_sound',
]

test.describe('webmcp', { tag: '@desktop' }, () => {
  test('lists palette tools and applies set_theme when WebMCP is enabled', async ({
    homePage,
    page,
  }) => {
    await homePage.goto()

    const names = await page.evaluate(async () => {
      const { modelContext } = document

      if (!modelContext?.getTools) {
        return null
      }

      const tools = await modelContext.getTools()

      return tools.map((tool) => tool.name)
    })

    if (names === null) {
      expect(names).toBeNull()
      return
    }

    expect(names.toSorted()).toEqual(TOOL_NAMES)

    const result = await page.evaluate(async () => {
      const { modelContext } = document

      if (!modelContext?.getTools || !modelContext.executeTool) {
        return null
      }

      const tools = await modelContext.getTools()
      const tool = tools.find((entry) => entry.name === 'set_theme')

      if (!tool) {
        return null
      }

      return modelContext.executeTool(tool, { mode: 'dark' })
    })

    expect(result).toEqual('Appearance is now dark.')
    await expect.poll(() => homePage.isDarkMode()).toBe(true)
  })
})
