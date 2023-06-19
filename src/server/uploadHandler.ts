import { imgExtensions } from '@/common/config'
import type { UploadResponse } from '@/common/types'
import fs from 'fs'
import path from 'path'
import sha1 from 'sha1'
import sharp from 'sharp'

export class UploadHandler {
  private readonly folder: string
  private readonly thumbsFolder: string
  constructor(folder: string, thumbsFolder: string) {
    this.folder = folder
    this.thumbsFolder = thumbsFolder
  }

  upload(name: string, fileData: Buffer): Promise<UploadResponse> {
    if (!fileData) {
      return Promise.reject('no file data')
    }
    const ext = path.extname(name).substring(1).toLowerCase()

    // Generate unique filename
    const shaName = sha1(fileData)

    // Save the file to disk
    const fileName = `${shaName}.${ext}`
    const filePath = path.join(this.folder, fileName)
    const thumbnailPath = path.join(this.thumbsFolder, fileName)

    return fs.promises
      .access(filePath)
      .then(() => {
        // file exists - due to hashing no need to save, good as success
        return { fileName }
      })
      .catch(() => {
        // File does not exist, write to it
        return fs.promises.writeFile(filePath, fileData).then(() => {
          if (imgExtensions.has(ext))
            sharp(fileData).resize(320, 200, { fit: 'contain' }).toFile(thumbnailPath)
          return { fileName }
        })
      })
  }
}
