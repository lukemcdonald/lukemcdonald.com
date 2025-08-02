type Redirect = {
  destination: string
  status: 301 | 302 | 303 | 307 | 308 | 300 | 304
}

export const REDIRECTS: Record<string, Redirect> = {
  '/resume': {
    status: 302,
    destination:
      'https://docs.google.com/document/d/1NopjwnwOtwKVqz33w8Glly2SKxfesS3oNKHyU8DO1jM/preview',
  },
}
