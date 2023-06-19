import { InterfaceServerManager } from '@/common/http-interface-server'
import type { ParentItem } from '@/common/types'
import express from 'express'
import path from 'path'
import { FileDB } from './file-db'
import { UploadHandler } from './uploadHandler'

// catch-all to prevent node from exiting
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise)
  console.error('Reason:', reason)
})
const args = process.argv.slice(2)
const port = args[0]

const clientPath = path.join(process.cwd(), 'build', 'client')
const dataPath = path.join(process.cwd(), 'data')
const inventoryCollection = path.join(dataPath, 'db', 'inventory')
const uploads = path.join(dataPath, 'uploads')
const thumbs = path.join(uploads, 'thumbs')
const manager = new InterfaceServerManager()
const uploadHandler = new UploadHandler(uploads, thumbs)

const app = express()
app.use(express.json())
app.use(express.raw({ type: '*/*', limit: '10mb' }))
const inventory = new FileDB<ParentItem>({
  filePath: inventoryCollection,
  onReady: () => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  },
  groupBy: (p) => p.date?.substring(0, 7) || 'null'
})

manager.register('allInventory', () => {
  return inventory.getAll()
})
manager.register('getInventory', async ({ getParams }) => {
  const [id] = await getParams()
  return inventory.getById(id)
})
manager.register('putInventory', async ({ getParams }) => {
  const [item] = await getParams()
  return inventory.upsert(item)
})

manager.register('uploads', async ({ req, path, getParams }) => {
  const [data] = await getParams()
  const name = req.url!.substring(path.length + 1)
  return uploadHandler.upload(name, data)
})

const clientHandler = express.static(clientPath)
app.use((req, res, next) => {
  if (res.headersSent) {
    return next()
  }
  manager.exec(req, res)

  if (res.headersSent) {
    return next()
  }
  clientHandler(req, res, next)
})
