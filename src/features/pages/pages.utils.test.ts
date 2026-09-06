import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildPagesFilter, sortPages } from './pages.utils.ts'

type PageStub = Parameters<typeof sortPages>[0][number]

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
