import type { EasterEgg, PickStrategy, Season } from './types'

const SEASON_MONTHS: Record<Season, readonly number[]> = {
  autumn: [9, 10, 11],
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  winter: [12, 1, 2],
}

export function pickEgg(
  eggs: readonly EasterEgg[],
  options: {
    date?: Date
    random?: () => number
    staticId?: string
    strategy: PickStrategy
  },
): EasterEgg | undefined {
  if (eggs.length === 0) {
    return undefined
  }

  if (options.strategy === 'static') {
    return pickStatic(eggs, options.staticId)
  }

  if (options.strategy === 'random') {
    return pickRandom(eggs, options.random ?? Math.random)
  }

  return pickScheduled(eggs, options.date ?? new Date())
}

export function matchesSchedule(egg: EasterEgg, date: Date): boolean {
  const schedule = egg.schedule

  if (!schedule) {
    return false
  }

  const month = date.getMonth() + 1
  const day = date.getDate()

  if (schedule.kind === 'month') {
    return schedule.months.includes(month)
  }

  if (schedule.kind === 'season') {
    return schedule.seasons.some((season) => SEASON_MONTHS[season].includes(month))
  }

  return isInCalendarRange(month, day, schedule.start, schedule.end)
}

function isInCalendarRange(
  month: number,
  day: number,
  start: { day: number; month: number },
  end: { day: number; month: number },
): boolean {
  const cursor = month * 100 + day
  const from = start.month * 100 + start.day
  const to = end.month * 100 + end.day

  if (from <= to) {
    return cursor >= from && cursor <= to
  }

  return cursor >= from || cursor <= to
}

function pickRandom(eggs: readonly EasterEgg[], random: () => number): EasterEgg | undefined {
  const index = Math.min(eggs.length - 1, Math.floor(random() * eggs.length))

  return eggs[index]
}

function pickScheduled(eggs: readonly EasterEgg[], date: Date): EasterEgg | undefined {
  const dated = eggs.filter((egg) => matchesSchedule(egg, date))

  return dated[0] ?? eggs.find((egg) => !egg.schedule)
}

function pickStatic(
  eggs: readonly EasterEgg[],
  staticId: string | undefined,
): EasterEgg | undefined {
  return eggs.find((egg) => egg.id === staticId) ?? eggs[0]
}
