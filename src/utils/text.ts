/**
 * Strip HTML tags, normalize whitespace, and truncate text to a specified length.
 *
 * @param content - The content to clean
 * @param maxLength - The maximum length of the text
 * @param ellipsis - The string to append when truncating (default: '...')
 * @returns The cleaned and truncated text
 */
export function stripHtmlAndTruncate(
  content?: string,
  maxLength: number = 160,
  ellipsis: string = '...',
): string {
  if (!content) {
    return ''
  }

  // Remove HTML tags and normalize whitespace
  const cleanText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  // Truncate to maxLength, breaking at word boundary
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
