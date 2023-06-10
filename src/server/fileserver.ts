import http from 'http'
import fs from 'fs'
import path from 'path'

const cache: { [key: string]: Buffer } = {}

type Props = {
  folder: string
  startsWith?: string
  useCache?: boolean
}

export const serveFolder =
  ({ folder, startsWith = '', useCache = true }: Props) =>
  (req: http.IncomingMessage, res: http.ServerResponse): boolean => {
    if (!req.url || !req.url.startsWith(startsWith)) {
      return false
    }

    // Get the file path by combining the current working directory with the requested URL
    const url = req.url.substring(startsWith.length)
    const filePath = path.join(folder, url)

    console.log(req.method, req.url)
    console.log('filePath', filePath)

    // Check if the file is in the cache
    if (useCache && cache[filePath]) {
      const fileData = cache[filePath]
      const contentType = getContentType(filePath)
      sendResponse(res, 200, contentType, fileData)
      return true
    }

    if (!fs.existsSync(filePath)) {
      // File not found -- no response, allow next handler
      console.log('file not found')
      return false
    }

    const stat = fs.statSync(filePath)
    const data = stat.isFile()
      ? fs.readFileSync(filePath)
      : Buffer.from(JSON.stringify(fs.readdirSync(filePath)))

    // Set the appropriate content type based on the file extension
    const contentType = getContentType(filePath)
    if (useCache) cache[filePath] = data
    sendResponse(res, 200, contentType, data)

    return true
  }

function sendResponse(
  res: http.ServerResponse,
  statusCode: number,
  contentType: string,
  data: Buffer | string
) {
  res.writeHead(statusCode, { 'Content-Type': contentType })
  res.end(data)
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath)
  switch (ext) {
    case '.html':
      return 'text/html'
    case '.css':
      return 'text/css'
    case '.js':
      return 'text/javascript'
    default:
      return 'text/plain'
  }
}
