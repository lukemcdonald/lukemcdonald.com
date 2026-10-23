import { existsSync, readFileSync } from 'node:fs'

const reportPath = process.argv[2] ?? 'test-results/results.json'

function collectSpecs(suites) {
  return suites.flatMap((suite) => {
    return [...(suite.specs ?? []), ...collectSpecs(suite.suites ?? [])]
  })
}

function isFlakySpec(spec) {
  const tests = spec.tests ?? []

  return tests.some((test) => test.status === 'flaky')
}

function getFlakyLines(report) {
  return collectSpecs(report.suites ?? [])
    .filter(isFlakySpec)
    .map((spec) => `- ${spec.file}: ${spec.title}`)
}

function printFlakySummary(path) {
  if (!existsSync(path)) {
    console.log('No Playwright JSON report found.')
    return
  }

  try {
    const flakes = getFlakyLines(JSON.parse(readFileSync(path, 'utf8')))

    if (flakes.length === 0) {
      console.log('None. Every test passed on the first try.')
      return
    }

    console.log(flakes.join('\n'))
  } catch {
    console.log('Could not parse Playwright JSON report.')
  }
}

console.log('## Flaky tests')
console.log()
printFlakySummary(reportPath)
