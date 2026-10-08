type AxeViolation = {
  help: string
  id: string
  impact?: string | null
  nodes: Array<{ target: unknown }>
}

export function summarizeViolations(violations: AxeViolation[]) {
  return violations.map((violation) => {
    return {
      help: violation.help,
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target),
    }
  })
}
