import type { BaseDB, ParentItem, UploadResponse } from './types'

export const ServerBase = '/srv'
export type EndPoint = {
  allInventory: () => ParentItem[]
  getInventory: (id: string) => ParentItem | undefined
  putInventory: (i: ParentItem) => BaseDB
  uploads: (o: any) => UploadResponse
}

export const imgExtensions = new Set<string>(['jpg', 'png', 'gif'])
