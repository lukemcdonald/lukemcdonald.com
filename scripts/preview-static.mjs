import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const host = '127.0.0.1'
const port = Number(process.env.E2E_PORT ?? 4321)

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

function resolveFile(requestPath) {
  const relative = normalize(decodeURIComponent(requestPath.split('?')[0]))
    .replaceAll(/^(\.\.(\/|\\|$))+/g, '')
    .replace(/^\//, '')
  const candidate = resolve(distDir, relative)

  return (
    existingFile(candidate) ??
    existingFile(join(candidate, 'index.html')) ??
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
  const filePath = resolveFile(req.url ?? '/')

  if (filePath) {
    sendFile(res, 200, filePath)
    return
  }

  const notFound = existingFile(join(distDir, '404.html'))

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
