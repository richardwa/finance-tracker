import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PersistanceCollection, type PageKey } from '@/client/stores/persistance-collection'
import { v4 as uuidv4 } from 'uuid'
import { format } from '@/client/util'

export type Item = Pick<PageKey, 'id'> & {
  date: string
  qty: number
  price: number
  source: string
  title: string
  notes: string
  images: string[]
}
export type ParentItem = PageKey &
  Item & {
    deleted: boolean
    _children: Item[]
  }

type InventoryStore = ParentItem[]

const collection = new PersistanceCollection<ParentItem>('inventory')

export const useInventoryStore = defineStore('inventory', () => {
  const store = ref<InventoryStore>([])

  const fetchInventory = async () => {
    const list = await collection.listAll()
    store.value = list.filter((p) => !p.deleted)
  }
  fetchInventory()

  const addRow = () => {
    const item = collection.createNew()
    item.qty = 1
    item.date = new Date().toLocaleDateString('en-CA')
    store.value.push(item)
    collection.save([item])
    return item
  }

  const addChildTo = (parent: ParentItem) => {
    const child = {
      id: uuidv4()
    } as Item
    child.qty = 1
    child.date = format(new Date())
    if (!parent._children) {
      parent._children = []
    }
    parent._children[parent._children.length] = child
    collection.save([parent])
    return child
  }

  const save = (items: ParentItem[]) => {
    collection.save(items)
  }

  return {
    store,
    addRow,
    addChildTo,
    save
  }
})
