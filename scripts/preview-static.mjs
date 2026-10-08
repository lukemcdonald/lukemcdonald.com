import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, posix, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const host = '127.0.0.1'
const port = Number(process.env.E2E_PORT || 4173)

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function isInsideDist(filePath) {
  const relative = filePath.slice(distDir.length)

  return filePath.startsWith(distDir) && (relative === '' || relative.startsWith(sep))
}

function existingFile(filePath) {
  if (!isInsideDist(filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return null
  }

  return filePath
}

function decodeRequestPath(requestPath) {
  return decodeURIComponent(requestPath.split('?')[0] ?? '/')
}

function resolveFile(decodedPath) {
  const relative = posix
    .normalize(decodedPath)
    .replaceAll(/^(?:\.\.(?:\/|$))+/g, '')
    .replace(/^\//, '')
  const segments = relative.split('/').filter((segment) => {
    return segment !== '' && segment !== '.' && segment !== '..'
  })
  const candidate = resolve(distDir, ...segments)

  return (
    existingFile(candidate) ??
    existingFile(resolve(candidate, 'index.html')) ??
    existingFile(`${candidate}.html`)
  )
}

function sendFile(res, status, file) {
  res.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
  })
  createReadStream(file).pipe(res)
}

const server = createServer((req, res) => {
  let decodedPath

  try {
    decodedPath = decodeRequestPath(req.url ?? '/')
  } catch {
    res.writeHead(400)
    res.end('Bad Request')
    return
  }

  const filePath = resolveFile(decodedPath)

  if (filePath) {
    sendFile(res, 200, filePath)
    return
  }

  const notFound = existingFile(resolve(distDir, '404.html'))

  if (notFound) {
    sendFile(res, 404, notFound)
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

server.listen(port, host, () => {
  process.stdout.write(`Previewing ${distDir} at http://${host}:${port}\n`)
})
