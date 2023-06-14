import type { Express } from 'express'

import { FileDB } from './file-db'
import type { ParentItem } from '@/common/types'

export const useInventoryHandler = (
  app: Express,
  reqPath: string,
  inventory: FileDB<ParentItem>
) => {
  app.get(reqPath, (req, res) => {
    res.json(inventory.getAll())
  })

  app.get(`${reqPath}/:id`, (req, res) => {
    const item = inventory.getById(req.params.id)
    if (item) {
      res.json(item)
    } else {
      res.status(404).json({ error: 'item not found ' + req.params.id })
    }
  })

  app.put(`${reqPath}/:id`, (req, res) => {
    const item: ParentItem = req.body
    inventory.upsert(item).then((b) => {
      res.status(200).json(b)
    })
  })
}
