export type BaseDB = {
  readonly id: string
  _v?: number
}

export type ChildItem = BaseDB & {
  date?: string
  qty?: number
  price?: number
  source?: string
  title?: string
  notes?: string
  images: string[]
}

export type ParentItem = ChildItem & {
  _children: string[]
  deleted?: boolean
}

export type UIParentItem = ChildItem & {
  _children: ChildItem[]
  deleted?: boolean
}

export type Item = ParentItem | ChildItem

export type UploadResponse = {
  fileName: string
}

export type Crud<T> = {
  getAll: () => T[]
  getById: (id: string) => T | undefined
  upsert: (t: T) => void
}

export type AsyncCrud<T> = {
  getAll: () => Promise<T[]>
  getById: (id: string) => Promise<T | undefined>
  upsert: (t: T) => Promise<{ _v: number }>
}
