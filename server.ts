import { ServerRequest, serve } from 'https://deno.land/std@0.53.0/http/server.ts'
import { readFileStr, exists } from 'https://deno.land/std@0.53.0/fs/mod.ts'

const basePath = './'

const encoder = new TextEncoder()

async function handler(req: ServerRequest) {
  if (req.url === '/favicon.ico') {
    return { status: 404 }
  }
  if (req.url.startsWith('/js/')) {
    const scriptPath = `${basePath}${req.url}`
    if (await exists(scriptPath)) {
      const headers = new Headers()
      headers.set('content-type', 'application/javascript')
      const script = await readFileStr(scriptPath, {
        encoding: 'utf8',
      })
      return { status: 200, headers, body: encoder.encode(script) }
    }
    return { status: 404 }
  }
  if (['/', '/index.html'].includes(req.url)) {
    const headers = new Headers()
    headers.set('content-type', 'text/html')
    headers.set('cache-control', 'none')
    const index = await readFileStr(`${basePath}/index.html`, {
      encoding: 'utf8',
    })
    return { status: 200, headers, body: encoder.encode(index) }
  }
  const headers = new Headers()
  headers.set('content-type', 'text/html')
  headers.set('cache-control', 'none')
  const notFoundIndex = await readFileStr(`${basePath}/404.html`, {
    encoding: 'utf8',
  })
  return { status: 404, headers, body: encoder.encode(notFoundIndex) }
}
const server = serve({ port: 8080 })
console.log('listening on http://localhost:8080')
for await (const req of server) {
  handler(req)
    .then((response) => req.respond(response))
    .catch((error) => {
      console.error(error)
      req.respond({
        status: 500,
        body: encoder.encode(error.message),
      })
    })
}
