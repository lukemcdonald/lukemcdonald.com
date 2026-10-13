/** First-party paths proxied to Cloudflare Web Analytics in `public/_redirects`. */
export const CLOUDFLARE_WEB_ANALYTICS = {
  rumPath: '/cf-insights',
  rumProxy: 'https://cloudflareinsights.com/cdn-cgi/rum',
  scriptPath: '/cf-insights.js',
  scriptProxy: 'https://static.cloudflareinsights.com/beacon.min.js',
} as const

export function getCloudflareBeaconConfig(token: string) {
  return {
    send: { to: CLOUDFLARE_WEB_ANALYTICS.rumPath },
    token,
  }
}
