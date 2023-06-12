import { format } from '@/client/util'
import { endPoints } from '@/common/config'
import { createChildItem, createParentItem } from '@/common/item-gen'
import type { AsyncCrud, ParentItem } from '@/common/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const store = ref<ParentItem[]>([])

  const crud: AsyncCrud<ParentItem> = {
    getAll: () => fetch(endPoints.inventory).then((r) => r.json()),
    getById: (id) => fetch(`${endPoints.inventory}/${id}`).then((r) => r.json()),
    upsert: (t) =>
      fetch(`${endPoints.inventory}/${t.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(t)
      }).then((r) => {
        if (r.status === 200) {
          return r.json()
        }
        throw new Error(r.statusText)
      })
  }

  const fetchInventory = async () => {
    const list: ParentItem[] = await crud.getAll()
    store.value = list.filter((p) => !p.deleted)
  }
  fetchInventory()

  const addRow = () => {
    const item = createParentItem()
    item.qty = 1
    item.date = format(new Date())
    store.value.push(item)
    crud.upsert(item).then((updated) => {
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
    const updated = await crud.upsert(parent)
    Object.assign(parent, updated)
  }

  const save = (item: ParentItem) =>
    crud
      .upsert(item)
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
