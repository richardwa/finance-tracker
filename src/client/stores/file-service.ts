import { callServerParams } from '@/common/http-interface-client'
import type { UploadResponse } from '@/common/types'
export const getImageUrl = (name: string) => `uploads/${name}`
export const getThumbUrl = (name: string) => `uploads/thumbs/${name}`

export const saveFile = (name: string, data: string | Blob | File): Promise<UploadResponse> =>
  callServerParams('uploads', name, data)

export const saveImage = async (...files: File[]): Promise<string[]> => {
  return Promise.all(
    files.map(async (s) => {
      return saveFile(s.name || `${Date.now()}.png`, s).then((b) => b.fileName)
    })
  )
}
