import type { Express, RequestHandler } from 'express'

import { InventoryDB } from './inventory-db'
import type { UIParentItem } from '@/common/types'

export const useInventoryHandler = (app: Express, reqPath: string, dbpath: string) => {
  const inventoryDB = new InventoryDB(dbpath)

  app.get(reqPath, (req, res) => {
    res.json(inventoryDB.getAll())
  })

  app.get(`${reqPath}/:id`, (req, res) => {
    const item = inventoryDB.getById(req.params.id)
    if (item) {
      res.json(item)
    } else {
      res.status(404).json({ error: 'item not found ' + req.params.id })
    }
  })

  app.put(`${reqPath}/:id`, (req, res) => {
    const item = req.body as UIParentItem
    inventoryDB.upsert(item)
    res.status(200).json(item)
  })
}
