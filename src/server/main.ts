import { endPoints } from '@/common/config'
import express from 'express'
import path from 'path'
import { useInventoryHandler } from './inventoryHandler'
import { useUploadHandler } from './uploadHandler'
import { FileDB } from './file-db'
import type { ParentItem } from '@/common/types'

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise)
  console.error('Reason:', reason)
  // Handle the rejection or perform cleanup tasks
  // You can also choose to ignore or log the rejection and continue execution
})
const args = process.argv.slice(2)
const port = args[0]

const clientPath = path.join(process.cwd(), 'build', 'client')
const dataPath = path.join(process.cwd(), 'data')
const dbPath = path.join(dataPath, 'db', 'inventory')
const uploads = path.join(dataPath, 'uploads')
const thumbs = path.join(uploads, 'thumbs')

const app = express()
const onReady = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}
app.use(express.json())

const inventory = new FileDB<ParentItem>({
  filePath: dbPath,
  onReady,
  groupBy: (p) => p.date?.substring(0, 7) || 'null'
})
useInventoryHandler(app, endPoints.inventory, inventory)

app.use(express.raw({ type: '*/*', limit: '10mb' }))
useUploadHandler(app, endPoints.uploads, uploads, thumbs)

const clientHandler = express.static(clientPath)
app.use((req, res, next) => {
  if (res.headersSent) {
    return next()
  }
  clientHandler(req, res, next)
})
