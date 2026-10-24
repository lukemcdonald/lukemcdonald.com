import { TEST_ID } from '../constants'
import { expect, test } from '../fixtures'

const JSON_LD_PATHS = ['/', '/resume', '/work/audiotheme'] as const

function collectDefinedIds(nodes: Array<Record<string, unknown>>) {
  return new Set(
    nodes.flatMap((node) => {
      return typeof node['@id'] === 'string' ? [node['@id']] : []
    }),
  )
}

function collectIdRefs(value: unknown, refs: string[] = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectIdRefs(item, refs)
    }

    return refs
  }

  if (!value || typeof value !== 'object') {
    return refs
  }

  const record = value as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.length === 1 && keys[0] === '@id' && typeof record['@id'] === 'string') {
    refs.push(record['@id'])

    return refs
  }

  for (const nested of Object.values(record)) {
    collectIdRefs(nested, refs)
  }

  return refs
}

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
    test(`json-ld @id references resolve on ${path}`, async ({ sitePage }) => {
      await sitePage.goto({ path })

      const text = await sitePage.page.getByTestId(TEST_ID.jsonLd).textContent()
      const data = JSON.parse(text ?? '') as { '@graph'?: Array<Record<string, unknown>> }
      const nodes = data['@graph'] ?? []
      const defined = collectDefinedIds(nodes)
      const refs = collectIdRefs(nodes)
      const person = nodes.find((node) => {
        return node['@type'] === 'Person'
      })

      expect(nodes.length).toBeGreaterThan(0)
      expect(refs.length).toBeGreaterThan(0)
      expect(typeof person?.jobTitle).toBe('string')
      expect(typeof person?.image).toBe('string')

      for (const id of refs) {
        expect(defined.has(id), id).toBe(true)
      }
    })
  }
})
