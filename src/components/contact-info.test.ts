import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { contactLinksFromBasics } from './contact-info.ts'

describe('contactLinksFromBasics', () => {
  test('puts email first, then profiles in source order', () => {
    assert.deepEqual(
      contactLinksFromBasics({
        email: 'thelukemcdonald@gmail.com',
        profiles: [
          { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
          {
            network: 'LinkedIn',
            url: 'https://www.linkedin.com/in/thelukemcdonald',
            username: 'thelukemcdonald',
          },
        ],
      }),
      [
        { href: 'mailto:thelukemcdonald@gmail.com', name: 'Email' },
        { href: 'https://github.com/lukemcdonald', name: 'GitHub' },
        { href: 'https://www.linkedin.com/in/thelukemcdonald', name: 'LinkedIn' },
      ],
    )
  })

  test('omits email when it is missing', () => {
    assert.deepEqual(
      contactLinksFromBasics({
        profiles: [
          { network: 'GitHub', url: 'https://github.com/lukemcdonald', username: 'lukemcdonald' },
        ],
      }),
      [{ href: 'https://github.com/lukemcdonald', name: 'GitHub' }],
    )
  })

  test('returns no links when email and profiles are empty', () => {
    assert.deepEqual(contactLinksFromBasics({}), [])
  })
})
