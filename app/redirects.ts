/**
 * Redirect configuration
 * Maps old paths to new paths (use '/' for homepage)
 *
 * Note: Pathnames are normalized (trailing slashes removed) before lookup,
 * so you only need to specify the version without trailing slash.
 *
 * To redirect to homepage:
 * '/old/path': '/'
 */
export const REDIRECTS: Record<string, string> = {
  '/jplayer-skins/premium-pixels': '/',
  '/obfuscated': '/',
  '/work/audiotheme': '/',
  '/work/blazer-six': '/',
  '/work/cedaro': '/',
  '/xmlrpc.php': '/',
}
