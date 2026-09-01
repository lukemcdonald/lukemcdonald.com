import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildPagesFilter, sortPages } from './pages.utils.ts'

type PageStub = Parameters<typeof sortPages>[0][number]

function page(
  id: string,
  data: {
    draft?: boolean
    order?: number
    pubDate?: Date | null
    title: string
  },
): PageStub {
  return {
    collection: 'pages',
    data: {
      draft: data.draft ?? false,
      order: data.order,
      pubDate: data.pubDate,
      title: data.title,
    },
    id,
  } as PageStub
}

describe('buildPagesFilter', () => {
  test('hides drafts unless allowDrafts is set', () => {
    const draft = page('secret.md', { draft: true, title: 'Secret' })
    const published = page('hello.md', { title: 'Hello' })

    assert.equal(buildPagesFilter()(draft), false)
    assert.equal(buildPagesFilter()(published), true)
    assert.equal(buildPagesFilter({ allowDrafts: true })(draft), true)
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

  test('excludes matching ids', () => {
    const filter = buildPagesFilter({ exclude: ['skip.md'] })

    assert.equal(filter(page('skip.md', { title: 'Skip' })), false)
    assert.equal(filter(page('keep.md', { title: 'Keep' })), true)
  })

  test('applies a pubDate window', () => {
    const early = page('early.md', {
      pubDate: new Date('2020-01-01T00:00:00.000Z'),
      title: 'Early',
    })
    const late = page('late.md', {
      pubDate: new Date('2024-06-01T00:00:00.000Z'),
      title: 'Late',
    })
    const undated = page('undated.md', { title: 'Undated' })
    const from2023 = buildPagesFilter({ dateFrom: '2023-01-01' })

    assert.equal(from2023(early), false)
    assert.equal(from2023(late), true)
    assert.equal(from2023(undated), true)
  })

  test('hides future pubDates when hideFuture is set', () => {
    const past = page('past.md', {
      pubDate: new Date('2000-01-01T00:00:00.000Z'),
      title: 'Past',
    })
    const future = page('future.md', {
      pubDate: new Date(Date.now() + 86_400_000),
      title: 'Future',
    })
    const filter = buildPagesFilter({ hideFuture: true })

    assert.equal(filter(past), true)
    assert.equal(filter(future), false)
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

  test('sorts by pubDate newest first', () => {
    const older = page('old.md', {
      pubDate: new Date('2020-01-01T00:00:00.000Z'),
      title: 'Old',
    })
    const newer = page('new.md', {
      pubDate: new Date('2024-01-01T00:00:00.000Z'),
      title: 'New',
    })

    assert.deepEqual(
      sortPages([older, newer], { sortBy: 'date' }).map((entry) => entry.id),
      ['new.md', 'old.md'],
    )
  })

  test('sorts by manual id order', () => {
    assert.deepEqual(
      sortPages([alpha, beta, zeta], {
        manualOrder: ['b.md', 'a.md'],
        sortBy: 'manual',
      }).map((entry) => entry.id),
      ['b.md', 'a.md', 'z.md'],
    )
  })

  test('uses a custom comparator', () => {
    assert.deepEqual(
      sortPages([alpha, beta], {
        customSort: (left, right) => right.data.title.localeCompare(left.data.title),
        sortBy: 'custom',
      }).map((entry) => entry.data.title),
      ['Beta', 'Alpha'],
    )
  })
})
