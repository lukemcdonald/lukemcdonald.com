export function stripHtmlAndTruncate(
  content?: string,
  maxLength: number = 160,
  ellipsis: string = '...',
): string {
  if (!content) {
    return ''
  }

  const cleanText = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanText.length <= maxLength) {
    return cleanText
  }

  const truncated = cleanText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + ellipsis
  }

  return truncated + ellipsis
}
