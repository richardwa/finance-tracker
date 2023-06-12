import { endPoints } from '@/common/config'
import express from 'express'
import path from 'path'
import { useInventoryHandler } from './inventoryHandler'
import { useUploadHandler } from './uploadHandler'
import { makeDirectoriesIfNotExist } from './util'

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
const dbPath = path.join(dataPath, 'db')
const uploads = path.join(dataPath, 'uploads')
const thumbs = path.join(uploads, 'thumbs')

const paths = [clientPath, dataPath, dbPath, uploads, thumbs]
paths.forEach(makeDirectoriesIfNotExist)

const app = express()
app.use(express.json())
useInventoryHandler(app, endPoints.inventory, path.join(dbPath, 'inventory.json'))

app.use(express.raw({ type: '*/*', limit: '10mb' }))
useUploadHandler(app, endPoints.uploads, uploads, thumbs)

const clientHandler = express.static(clientPath)
app.use((req, res, next) => {
  if (res.headersSent) {
    return next()
  }
  clientHandler(req, res, next)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
