import { endPoints } from '@/common/config'
import type { UploadResponse } from '@/common/types'
export const getImageUrl = (name: string) => `${endPoints.uploads}/${name}`
export const getThumbUrl = (name: string) => `${endPoints.uploads}/thumb/${name}`

export const saveFile = (name: string, data: string | Blob | File): Promise<UploadResponse> =>
  fetch(`${endPoints.uploads}/${name}`, {
    method: 'POST',
    body: data
  }).then((r) => r.json())

export const saveImage = async (...files: File[]): Promise<string[]> => {
  return Promise.all(
    files.map(async (s) => {
      return saveFile(s.name, s).then((b) => b.fileName)
    })
  )
}
