import { TEST_ID } from '../constants'
import { expect, test } from '../fixtures'

const JSON_LD_PATHS = ['/', '/resume', '/work/audiotheme'] as const

test.describe('seo', { tag: '@smoke' }, () => {
  test('sitemap includes lastmod for every url', async ({ sitePage }) => {
    const response = await sitePage.page.request.get('/sitemap-0.xml')
    const xml = await response.text()
    const urls = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => {
      return match[1]
    })

    expect(response.status()).toBe(200)
    expect(urls.length).toBeGreaterThan(0)

    for (const url of urls) {
      expect(url, url).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}(?:T[\d:.Z+-]+)?<\/lastmod>/)
    }
  })

  for (const path of JSON_LD_PATHS) {
    test(`json-ld describes a person on ${path}`, async ({ sitePage }) => {
      await sitePage.goto({ path })

      const script = sitePage.page.getByTestId(TEST_ID.jsonLd)
      const text = await script.textContent()
      const data = JSON.parse(text ?? '') as { '@graph'?: Array<Record<string, unknown>> }
      const person = data['@graph']?.find((node) => {
        return node['@type'] === 'Person'
      })

      await expect(script).toHaveCount(1)
      expect(person).toBeTruthy()
      expect(typeof person?.jobTitle).toBe('string')
      expect(typeof person?.image).toBe('string')
    })
  }
})
