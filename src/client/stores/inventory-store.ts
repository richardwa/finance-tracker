import { format } from '@/client/util'
import { endPoints } from '@/common/config'
import { createChildItem, createParentItem } from '@/common/item-gen'
import type { AsyncCrud, UIParentItem } from '@/common/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const store = ref<UIParentItem[]>([])

  const crud: AsyncCrud<UIParentItem> = {
    getAll: () => fetch(endPoints.inventory).then((r) => r.json()),
    getById: (id) => fetch(`${endPoints.inventory}/${id}`).then((r) => r.json()),
    upsert: (t) =>
      fetch(`${endPoints.inventory}/${t.id}`, {
        method: 'PUT',
        body: JSON.stringify(t)
      }).then((r) => r.json())
  }

  const fetchInventory = async () => {
    const list: UIParentItem[] = await crud.getAll()
    store.value = list.filter((p) => !p.deleted)
  }
  fetchInventory()

  const addRow = () => {
    const item = createParentItem()
    item.qty = 1
    item.date = format(new Date())
    store.value.push(item)
    return item
  }

  const addChildTo = (parent: UIParentItem) => {
    const child = createChildItem()
    child.qty = 1
    child.date = format(new Date())
    parent._children[parent._children.length] = child
    crud.upsert(parent)
    return child
  }

  const save = (item: UIParentItem) => {
    crud.upsert(item)
  }

  return {
    store,
    addRow,
    addChildTo,
    save
  }
})
