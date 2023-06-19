export type BaseDB = {
  readonly id: string
  _v?: number
}

export type ChildItem = {
  date?: string
  qty?: number
  price?: number
  source?: string
  title?: string
  notes?: string
  images: string[]
}

export type ParentItem = BaseDB &
  ChildItem & {
    _children: ChildItem[]
    deleted?: boolean
  }

export type UploadResponse = {
  fileName: string
}
