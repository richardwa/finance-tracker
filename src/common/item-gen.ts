import { v4 } from 'uuid'
import type { ChildItem, ParentItem } from './types'

export const createParentItem = (): ParentItem => ({
  id: v4(),
  _v: 0,
  _children: [],
  images: []
})

export const createChildItem = (): ChildItem => ({
  images: []
})
