import { endPoints } from '@/common/config'
import express from 'express'
import path from 'path'
import { useInventoryHandler } from './inventoryHandler'
import { useUploadHandler } from './uploadHandler'
const args = process.argv.slice(2)
const port = args[0]
const app = express()

app.get(endPoints.hello, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello from server!!')
})

const clientJS = path.join(process.cwd(), 'build', 'client')
const dbfile = path.join(process.cwd(), 'data', 'db', 'inventory.json')
const uploads = path.join(process.cwd(), 'data', 'uploads')

useInventoryHandler(app, endPoints.inventory, dbfile)
useUploadHandler(app, endPoints.uploads, uploads)

app.use((req, res, next) => {
  if (res.headersSent) {
    return next()
  }
  express.static(clientJS)(req, res, next)
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
