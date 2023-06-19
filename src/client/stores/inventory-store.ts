import { format } from '@/client/util'
import { callServer } from '@/common/http-interface-client'
import { createChildItem, createParentItem } from '@/common/item-gen'
import type { ParentItem } from '@/common/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const store = ref<ParentItem[]>([])

  const fetchInventory = async () => {
    const list: ParentItem[] = await callServer('allInventory')
    store.value = list.filter((p) => !p.deleted)
  }
  fetchInventory()

  const addRow = () => {
    const item = createParentItem()
    item.qty = 1
    item.date = format(new Date())
    store.value.push(item)
    callServer('putInventory', item).then((updated) => {
      Object.assign(item, updated)
    })
    return item
  }

  const addChildTo = async (parent: ParentItem): Promise<void> => {
    const child = createChildItem()
    child.qty = 1
    child.date = format(new Date())
    const children = parent._children || []
    parent._children = children
    children.push(child)
    const updated = await callServer('putInventory', parent)
    Object.assign(parent, updated)
  }

  const save = (item: ParentItem) =>
    callServer('putInventory', item)
      .then((updated) => {
        Object.assign(item, updated)
      })
      .catch((e) => {
        console.warn('update rejected', e)
      })

  return {
    store,
    addRow,
    addChildTo,
    save
  }
})
