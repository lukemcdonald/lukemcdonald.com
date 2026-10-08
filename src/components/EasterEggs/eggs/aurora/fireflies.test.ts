import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'

import { mountAuroraFireflies, unmountAuroraFireflies } from './fireflies.ts'

type FakeNode = {
  attributes: Record<string, string>
  properties: Record<string, string>
  remove: () => void
  setAttribute: (name: string, value: string) => void
  style: {
    left: string
    setProperty: (name: string, value: string) => void
    top: string
  }
}

function installDocument() {
  const nodes: FakeNode[] = []

  function createNode(): FakeNode {
    const node: FakeNode = {
      attributes: {},
      properties: {},
      remove() {
        const index = nodes.indexOf(node)

        if (index >= 0) {
          nodes.splice(index, 1)
        }
      },
      setAttribute(name, value) {
        node.attributes[name] = value
      },
      style: {
        left: '',
        setProperty(name, value) {
          node.properties[name] = value
        },
        top: '',
      },
    }

    return node
  }

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      body: {
        append(node: FakeNode) {
          nodes.push(node)
        },
      },
      createElement() {
        return createNode()
      },
      querySelector() {
        return nodes[0] ?? null
      },
      querySelectorAll() {
        return nodes.slice()
      },
    },
    writable: true,
  })

  return nodes
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'document')
})

describe('aurora fireflies', () => {
  test('mounts five staggered fireflies once and unmounts them', () => {
    const nodes = installDocument()

    mountAuroraFireflies()
    mountAuroraFireflies()

    assert.equal(nodes.length, 5)
    assert.equal(nodes[0]?.attributes['aria-hidden'], 'true')
    assert.equal(nodes[0]?.attributes['data-aurora-firefly'], 'a')
    assert.equal(nodes[0]?.style.left, '12%')
    assert.equal(nodes[0]?.style.top, '86%')
    assert.equal(nodes[0]?.properties['--aurora-firefly-blink'], '3.1s')
    assert.equal(nodes[0]?.properties['--aurora-firefly-delay'], '0s')
    assert.equal(nodes[0]?.properties['--aurora-firefly-drift'], '11s')
    assert.equal(nodes[1]?.attributes['data-aurora-firefly'], 'b')
    assert.equal(nodes[2]?.attributes['data-aurora-firefly'], 'c')

    unmountAuroraFireflies()
    assert.equal(nodes.length, 0)
  })
})
