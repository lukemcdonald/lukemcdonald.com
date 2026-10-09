import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildPagesFilter, resolvePageSeo, sortPages } from './pages.utils.ts'

type PageStub = Parameters<typeof sortPages>[0][number]

describe('buildPagesFilter', () => {
  test('always hides drafts', () => {
    const draft = page('secret.md', { draft: true, title: 'Secret' })
    const published = page('hello.md', { title: 'Hello' })

    assert.equal(buildPagesFilter()(draft), false)
    assert.equal(buildPagesFilter()(published), true)
  })

  test('includes by id or content directory', () => {
    const filter = buildPagesFilter({ include: ['i-am-a'] })

    assert.equal(filter(page('i-am-a/christian.md', { title: 'Christian' })), true)
    assert.equal(filter(page('about.md', { title: 'About' })), false)
    assert.equal(
      buildPagesFilter({ include: ['about.md'] })(page('about.md', { title: 'About' })),
      true,
    )
  })
})

describe('resolvePageSeo', () => {
  test('prefers seo.description over frontmatter description and rendered html', () => {
    const seo = resolvePageSeo({
      data: {
        description: 'Frontmatter summary.',
        seo: { description: 'SEO override.' },
        title: 'About',
      },
      rendered: { html: '<p>Rendered body.</p>' },
    })

    assert.equal(seo.description, 'SEO override.')
  })

  test('prefers frontmatter description over rendered html', () => {
    const seo = resolvePageSeo({
      data: {
        description: 'Frontmatter summary.',
        title: 'About',
      },
      rendered: { html: '<p>Rendered body.</p>' },
    })

    assert.equal(seo.description, 'Frontmatter summary.')
  })

  test('falls back to rendered html when no description fields exist', () => {
    const seo = resolvePageSeo({
      data: { title: 'About' },
      rendered: { html: '<p>Rendered body.</p>' },
    })

    assert.equal(seo.description, '<p>Rendered body.</p>')
  })

  test('prefers seo.title over the page title', () => {
    const seo = resolvePageSeo({
      data: {
        seo: { title: 'Custom title' },
        title: 'About',
      },
    })

    assert.equal(seo.title, 'Custom title')
  })

  test('passes through seo.ogImage', () => {
    const seo = resolvePageSeo({
      data: {
        seo: { ogImage: '/custom-share.jpg' },
        title: 'About',
      },
    })

    assert.equal(seo.ogImage, '/custom-share.jpg')
  })

  test('leaves ogImage undefined when omitted', () => {
    const seo = resolvePageSeo({
      data: { title: 'About' },
    })

    assert.equal(seo.ogImage, undefined)
    assert.equal(seo.title, 'About')
    assert.equal(seo.description, undefined)
  })
})

describe('sortPages', () => {
  const alpha = page('a.md', { title: 'Alpha' })
  const zeta = page('z.md', { order: 1, title: 'Zeta' })
  const beta = page('b.md', { order: 2, title: 'Beta' })

  test('sorts by title by default', () => {
    assert.deepEqual(
      sortPages([zeta, alpha, beta]).map((entry) => entry.data.title),
      ['Alpha', 'Beta', 'Zeta'],
    )
  })

  test('sorts by order then title', () => {
    assert.deepEqual(
      sortPages([alpha, beta, zeta], { sortBy: 'order' }).map((entry) => entry.id),
      ['z.md', 'b.md', 'a.md'],
    )
  })
})

function page(
  id: string,
  data: {
    draft?: boolean
    order?: number
    title: string
  },
): PageStub {
  return {
    collection: 'pages',
    data: {
      draft: data.draft ?? false,
      order: data.order,
      title: data.title,
    },
    id,
  } as PageStub
}
