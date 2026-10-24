import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { GLOBAL_CONFIG } from '@/configs/global'

import {
  applySitemapLastmod,
  getFrontmatterLastmod,
  getSitemapLastmod,
  resolveSitemapSourcePaths,
  toSitemapPathname,
} from './sitemap.ts'

const ORIGIN = GLOBAL_CONFIG.site.origin

function sitemapUrl(pathname: string) {
  return new URL(pathname, ORIGIN).href
}

describe('getFrontmatterLastmod', () => {
  test('prefers updated over date in markdown frontmatter', () => {
    const source = [
      '---',
      'date: 2024-01-15',
      'title: About',
      'updated: 2026-03-02',
      '---',
      '',
    ].join('\n')

    assert.equal(getFrontmatterLastmod(source), '2026-03-02')
  })

  test('falls back to date when updated is missing', () => {
    const source = ['---', 'date: 2024-01-15', 'title: About', '---', ''].join('\n')

    assert.equal(getFrontmatterLastmod(source), '2024-01-15')
  })

  test('reads a top-level updated field from yaml', () => {
    const source = ['label: Engineer', 'updated: 2026-10-21', ''].join('\n')

    assert.equal(getFrontmatterLastmod(source), '2026-10-21')
  })

  test('returns undefined when neither updated nor date is present', () => {
    const source = ['---', 'title: About', '---', ''].join('\n')

    assert.equal(getFrontmatterLastmod(source), undefined)
  })
})

describe('toSitemapPathname', () => {
  test('uses / for the site origin and strips a trailing slash elsewhere', () => {
    assert.equal(toSitemapPathname(`${ORIGIN}/`), '/')
    assert.equal(toSitemapPathname(`${ORIGIN}/resume/`), '/resume')
    assert.equal(toSitemapPathname(`${ORIGIN}/work/audiotheme`), '/work/audiotheme')
  })
})

describe('resolveSitemapSourcePaths', () => {
  test('maps / to index.md', () => {
    assert.deepEqual(resolveSitemapSourcePaths('/'), ['src/content/pages/index.md'])
  })

  test('maps a markdown page path', () => {
    assert.deepEqual(resolveSitemapSourcePaths('/work/audiotheme'), [
      'src/content/pages/work/audiotheme.md',
    ])
  })

  test('maps /resume to basics.yaml', () => {
    assert.deepEqual(resolveSitemapSourcePaths('/resume'), ['src/content/resume/basics.yaml'])
  })
})

describe('getSitemapLastmod', () => {
  test('returns undefined when no source file exists', () => {
    assert.equal(getSitemapLastmod('/missing-page'), undefined)
  })
})

describe('applySitemapLastmod', () => {
  test('leaves lastmod off when the url has no content date', () => {
    const item = applySitemapLastmod({ url: sitemapUrl('/missing-page') })

    assert.equal('lastmod' in item, false)
  })
})
