const binders = new WeakMap<Element, AbortController>()

export const COPIED_BUTTON_LABEL = 'Copied MCP URL'
export const COPIED_LABEL = 'Copied'
const COPIED_RESET_MS = 2000
export const COPY_BUTTON_LABEL = 'Copy MCP URL'
export const COPY_LABEL = 'Copy'

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

export function setCopyFeedback(root: Element, copied: boolean) {
  const button = root.querySelector<HTMLButtonElement>('[data-mcp-copy]')
  const status = root.querySelector<HTMLElement>('[data-mcp-copy-status]')

  if (!button || !status) {
    return
  }

  button.setAttribute('aria-label', copied ? COPIED_BUTTON_LABEL : COPY_BUTTON_LABEL)
  button.textContent = copied ? COPIED_LABEL : COPY_LABEL
  status.textContent = copied ? COPIED_LABEL : ''
}

export function bindMcpCallouts(root: ParentNode = document) {
  root.querySelectorAll('[data-mcp-callout]').forEach(bindCallout)
}

function bindCallout(root: Element) {
  const button = root.querySelector<HTMLButtonElement>('[data-mcp-copy]')

  if (!button) {
    return
  }

  binders.get(root)?.abort()

  const controller = new AbortController()
  const { signal } = controller

  binders.set(root, controller)

  let resetTimer = 0

  button.addEventListener(
    'click',
    () => {
      void copyFromButton(root, button, () => {
        window.clearTimeout(resetTimer)
        resetTimer = window.setTimeout(() => {
          setCopyFeedback(root, false)
        }, COPIED_RESET_MS)
      })
    },
    { signal },
  )
}

async function copyFromButton(root: Element, button: HTMLButtonElement, onCopied: () => void) {
  const text = button.dataset.mcpCopy

  if (!text) {
    return
  }

  try {
    await copyText(text)
    setCopyFeedback(root, true)
    onCopied()
  } catch {
    setCopyFeedback(root, false)
  }
}
