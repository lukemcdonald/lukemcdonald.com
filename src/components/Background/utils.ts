export const GRASS_IDS = ['1', '2', '3', '4'] as const

export type GrassId = (typeof GRASS_IDS)[number]

/**
 * Build-time pick; prerendered pages keep the same pair until the next build.
 */
export function pickGrassId({
  excludeId,
  random = Math.random,
}: {
  excludeId?: GrassId
  random?: () => number
} = {}) {
  const pool = GRASS_IDS.filter((id) => id !== excludeId)
  const index = Math.floor(random() * pool.length)
  const id = pool[index]

  if (!id) {
    throw new Error('Expected at least one grass id')
  }

  return id
}
