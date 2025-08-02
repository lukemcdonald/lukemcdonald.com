type Redirect = {
  destination: string
  status: 301 | 302 | 303 | 304 | 307 | 308
}

export const REDIRECTS: Record<string, Redirect> = {
  // Add future redirects here
  // Note: /resume redirect is handled in public/_redirects for Netlify compatibility
}
