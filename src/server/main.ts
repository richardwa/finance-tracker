import path from 'path'
import http from 'http'
import { serveFolder } from './fileserver'
import { endPoints } from '@/common/config'
const args = process.argv.slice(2)
const port = args[0]

const clientJS = path.join(process.cwd(), 'build', 'client')
const serveClientJS = serveFolder({ folder: clientJS })

const server = http.createServer((req, res) => {
  if (req.url?.startsWith(endPoints.hello)) {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello from server!!')
    return
  }

  serveClientJS(req, res)
  return
})
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
