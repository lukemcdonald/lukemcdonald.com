export function wrapIndex(index: number, delta: number, length: number) {
  if (length <= 0) {
    return -1
  }

  if (index < 0) {
    return delta > 0 ? 0 : length - 1
  }

  return (index + delta + length) % length
}
