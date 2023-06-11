import type { BaseDB, ChildItem, Crud, ParentItem, UIParentItem } from '@/common/types'
import { FileDB } from './file-db'
import { groupBy, isEqual } from 'lodash/fp'
import AsyncLock from 'async-lock'

const lock = new AsyncLock({ timeout: 5000 })

export class InventoryDB implements Crud<UIParentItem> {
  private db: FileDB<ChildItem | ParentItem>
  private cache = new Map<string, UIParentItem>()
  constructor(file: string) {
    this.db = new FileDB(file, () => {
      this.load()
    })
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

  upsert(t: UIParentItem): Promise<UIParentItem> {
    return new Promise((res, rej) => {
      const old = this.cache.get(t.id)
      this.cache.set(t.id, t)
      if (!old) {
        this.db.upsert(t).then((b) => {
          Object.assign(t, b)
          res(t)
        })
        return
      }

      lock.acquire(t.id, (done) => {
        const { _children, ...item } = t
        const oldChildren = groupBy('id', old._children)
        const promises: Promise<BaseDB>[] = []
        _children.forEach((c) => {
          const oldChild = oldChildren[c.id]
          if (!oldChild || !oldChild[0] || !isEqual(oldChild[0], c)) {
            promises.push(
              this.db.upsert(c).then((b) => {
                Object.assign(c, b)
                return b
              })
            )
          }
        })
        const parentItem: ParentItem = { ...item, _children: _children.map((c) => c.id) }
        this.cache.set(t.id, t)
        promises.push(
          this.db.upsert(parentItem).then((b) => {
            console.log('updated', b)
            Object.assign(t, b)
            return b
          })
        )

        Promise.all(promises).then(() => {
          done()
          res(t)
        })
      })
    })
  }
}
