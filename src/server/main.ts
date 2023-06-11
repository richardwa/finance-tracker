import { endPoints } from '@/common/config'
import express from 'express'
import path from 'path'
import { useInventoryHandler } from './inventoryHandler'
import { useUploadHandler } from './uploadHandler'
const args = process.argv.slice(2)
const port = args[0]
const app = express()

const clientPath = path.join(process.cwd(), 'build', 'client')
const clientHandler = express.static(clientPath)
const dataPath = path.join(process.cwd(), 'data')
const dbfile = path.join(dataPath, 'db', 'inventory.json')
const uploads = path.join(dataPath, 'uploads')
const thumbs = path.join(uploads, 'thumbs')

useInventoryHandler(app, endPoints.inventory, dbfile)
useUploadHandler(app, endPoints.uploads, uploads, thumbs)

app.use((req, res, next) => {
  if (res.headersSent) {
    return next()
  }
  clientHandler(req, res, next)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
