export function toggleClasses(element: Element, className: string, enabled: boolean) {
  for (const token of className.split(/\s+/)) {
    if (token) {
      element.classList.toggle(token, enabled)
    }
  }
}
