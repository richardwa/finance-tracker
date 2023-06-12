import { v4 } from 'uuid'
import type { ChildItem, UIParentItem } from './types'

export const createParentItem = (): UIParentItem => ({
  id: v4(),
  _v: 0,
  _children: [],
  images: []
})

export const createChildItem = (): ChildItem => ({
  images: []
})
