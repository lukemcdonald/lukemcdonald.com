import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { buildHtmlRedirectRules } from './html-redirects.ts'

function parseRedirectRule(rule: string) {
  const [from, to, status] = rule.split(/\s+/)

  return { from, status, to }
}

describe('buildHtmlRedirectRules', () => {
  test('covers every page route and maps .html to the clean path', () => {
    const pages = [
      { pathname: '' },
      { pathname: 'index' },
      { pathname: 'resume' },
      { pathname: 'tread-talks/' },
      { pathname: '/work/audiotheme' },
      { pathname: 'i-am-a/christian/' },
    ]
    const expectedTos = ['/', '/i-am-a/christian', '/resume', '/tread-talks', '/work/audiotheme']
    const rules = buildHtmlRedirectRules(pages).split('\n').filter(Boolean).map(parseRedirectRule)

    assert.deepEqual(rules.map((rule) => rule.to).sort(), expectedTos)

    for (const rule of rules) {
      const expectedFrom = rule.to === '/' ? '/index.html' : `${rule.to}.html`

      assert.equal(rule.from, expectedFrom)
      assert.equal(rule.status, '301!')
    }
  })

  test('skips api, dev, and status pages', () => {
    const rules = buildHtmlRedirectRules([
      { pathname: '404' },
      { pathname: '500/' },
      { pathname: 'api/resume.json' },
      { pathname: 'dev/theme' },
      { pathname: 'resume' },
    ])
    const parsed = rules.split('\n').filter(Boolean).map(parseRedirectRule)

    assert.deepEqual(
      parsed.map((rule) => rule.to),
      ['/resume'],
    )
  })

  test('does not emit rules that would shadow existing redirects', () => {
    const existing = ['/resume.html  /legacy-resume  301!', '/xmlrpc.php  /  301'].join('\n')
    const rules = buildHtmlRedirectRules(
      [{ pathname: 'resume' }, { pathname: 'tread-talks' }],
      existing,
    )
    const parsed = rules.split('\n').filter(Boolean).map(parseRedirectRule)

    assert.deepEqual(
      parsed.map((rule) => rule.from),
      ['/tread-talks.html'],
    )
  })
})
