import { expect, test } from '../fixtures'

test.describe('head', { tag: '@smoke' }, () => {
  test('icon and manifest files are reachable', async ({ homePage }) => {
    await homePage.goto()

    const links = await homePage.page.evaluate(() => {
      return [
        ...document.querySelectorAll(
          'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]',
        ),
      ].flatMap((link) => {
        const href = link.getAttribute('href')
        const rel = link.getAttribute('rel')

        if (!href || !rel) {
          return []
        }

        return [{ href, rel }]
      })
    })

    for (const { href } of links) {
      const response = await homePage.page.request.get(href)

      expect(response.status(), href).toBe(200)
    }

    const manifest = links.find((link) => {
      return link.rel === 'manifest'
    })

    if (!manifest) {
      expect(manifest, 'manifest link').toBeTruthy()
      return
    }

    const manifestResponse = await homePage.page.request.get(manifest.href)
    const body = (await manifestResponse.json()) as { icons?: Array<{ src: string }> }

    for (const icon of body.icons ?? []) {
      const response = await homePage.page.request.get(icon.src)

      expect(response.status(), icon.src).toBe(200)
    }
  })
})
