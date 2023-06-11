import type { ChildItem, Crud, ParentItem, UIParentItem } from '@/common/types'
import { FileDB } from './file-db'
import { isEqual } from 'lodash/fp'

export class InventoryDB implements Crud<UIParentItem> {
  private db: FileDB<ChildItem | ParentItem>
  private cache = new Map<string, UIParentItem>()
  constructor(file: string) {
    this.db = new FileDB(file)
    this.load()
  }

  private load() {
    const all = this.db.getAll()
    const parents: ParentItem[] = []
    const children: { [s: string]: ChildItem } = {}
    for (const item of all) {
      if ('deleted' in item && item.deleted) continue

      if ('_children' in item) {
        parents.push(item)
      } else {
        children[item.id] = item
      }
    }

    const uiparents: UIParentItem[] = parents.map(({ _children, ...item }) => ({
      ...item,
      _children: _children.map((id) => children[id])
    }))

    for (const p of uiparents) {
      this.cache.set(p.id, p)
    }
  }

  getAll(): UIParentItem[] {
    return Array.from(this.cache.values())
  }

  getById(id: string): UIParentItem | undefined {
    return this.cache.get(id)
  }

  upsert(t: UIParentItem): void {
    const { _children, ...item } = t
    _children.forEach((c) => {
      if (!isEqual(this.cache.get(c.id), c)) {
        this.db.upsert(c)
      }
    })
    const parentItem: ParentItem = { ...item, _children: _children.map((c) => c.id) }
    const id = this.db.upsert(parentItem)
    t._v = parentItem._v
    this.cache.set(id, t)
  }
}
