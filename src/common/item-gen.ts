import { uniqueId } from 'lodash'
import type { ChildItem, UIParentItem } from './types'

export const createParentItem = (): UIParentItem => ({
  id: uniqueId(),
  _v: 0,
  _children: [],
  images: []
})

export const createChildItem = (): ChildItem => ({
  id: uniqueId(),
  _v: 0,
  images: []
})
