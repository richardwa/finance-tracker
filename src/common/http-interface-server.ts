import { ServerBase, type EndPoint } from '@/common/config'
import type { IncomingMessage, ServerResponse } from 'http'

type HandlerFunc = (req: IncomingMessage, res: ServerResponse, matchedPath: string) => void

const parseReqBody = <T>(req: IncomingMessage) =>
  new Promise<T>((res, rej) => {
    const body: string[] = []
    req.on('data', (chunk) => {
      body.push(chunk)
    })
    req.on('end', async () => {
      if (body.length === 0) {
        res(undefined as T)
      } else {
        const str = body.join('')
        if (req.headers['content-type'] === 'application/json') {
          res(JSON.parse(str) as T)
        } else {
          res(str as T)
        }
      }
    })
    req.on('error', (err) => {
      rej(err)
    })
  })

type MethodArgs<T extends keyof EndPoint> = {
  req: IncomingMessage
  res: ServerResponse
  path: string
  getParams: () => Promise<Parameters<EndPoint[T]>>
}
export class InterfaceServerManager {
  private handlers = new Map<string, HandlerFunc>()

  register<T extends keyof EndPoint>(
    path: T,
    method: (a: MethodArgs<T>) => Promise<ReturnType<EndPoint[T]>> | ReturnType<EndPoint[T]>
  ) {
    const handler: HandlerFunc = async (req, res, matchedPath) => {
      try {
        const result = await method({
          req,
          res,
          path: matchedPath,
          getParams: () => parseReqBody<Parameters<EndPoint[T]>>(req)
        })

        if (result) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } else {
          res.end()
        }
      } catch (e) {
        console.error(e)
        res.writeHead(500)
        res.end()
      }
    }
    for (const key of this.handlers.keys()) {
      if (path.startsWith(key)) {
        throw Error(`Path conflict: ${path} is covered ${key}`)
      }
    }
    this.handlers.set(path, handler)
  }

  exec(req: IncomingMessage, res: ServerResponse) {
    for (const [key, func] of this.handlers.entries()) {
      const path = `${ServerBase}/${key}`
      if (req.url?.startsWith(path)) {
        func(req, res, path)
        return true
      }
    }
    return false
  }
}
