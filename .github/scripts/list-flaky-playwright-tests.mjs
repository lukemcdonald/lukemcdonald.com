import { existsSync, readFileSync } from 'node:fs'

const reportPath = process.argv[2] ?? 'test-results/results.json'

function getFlakyLines(report) {
  const flakes = []

  const visit = (suite) => {
    for (const spec of suite.specs ?? []) {
      if (spec.tests?.some((test) => test.status === 'flaky')) {
        flakes.push(`- ${spec.file}: ${spec.title}`)
      }
    }

    for (const child of suite.suites ?? []) {
      visit(child)
    }
  }

  for (const suite of report.suites ?? []) {
    visit(suite)
  }

  return flakes
}

console.log('## Flaky tests')
console.log()

if (!existsSync(reportPath)) {
  console.log('No Playwright JSON report found.')
  process.exit(0)
}

try {
  const report = JSON.parse(readFileSync(reportPath, 'utf8'))
  const flakes = getFlakyLines(report)

  if (flakes.length === 0) {
    console.log('None. Every test passed on the first try.')
  } else {
    console.log(flakes.join('\n'))
  }
} catch {
  console.log('Could not parse Playwright JSON report.')
}
