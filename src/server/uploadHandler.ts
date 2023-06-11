import { imgExtensions } from '@/common/config'
import type { UploadResponse } from '@/common/types'
import type { Express, Request, Response } from 'express'
import express from 'express'
import fs from 'fs'
import path from 'path'
import sha1 from 'sha1'
import sharp from 'sharp'

export const useUploadHandler = (app: Express, reqPath: string, folder: string) => {
  // POST /upload - Handle file upload and generate thumbnail
  app.post(`${reqPath}/:name`, async (req: Request, res: Response) => {
    const fileData = req.body as string
    const ext = path.extname(req.params.name).substring(1).toLowerCase()

    if (!fileData) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    // Generate unique filename
    const shaName = sha1(fileData)

    // Save the file to disk
    const fileName = `${shaName}.${ext}`
    const filePath = path.join(folder, fileName)
    const thumbnailPath = path.join(folder, 'thumbs', fileName)
    const done = () => {
      const r: UploadResponse = {
        fileName
      }
      res.json(r)
    }
    fs.access(filePath, (err) => {
      if (err) {
        // File does not exist, write to it
        fs.writeFile(filePath, fileData, done)
        if (imgExtensions.has(ext))
          sharp(fileData).resize(320, 200, { fit: 'contain' }).toFile(thumbnailPath)
      } else {
        done()
      }
    })
  })

  // Serve uploaded files and thumbnails statically
  app.use(reqPath, express.static(folder))
}
