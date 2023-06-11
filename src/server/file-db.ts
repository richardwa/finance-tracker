import * as fs from 'fs'
import AsyncLock from 'async-lock'
import type { BaseDB, Crud } from '@/common/types'

const lock = new AsyncLock({ timeout: 5000 })

export class FileDB<T extends BaseDB> implements Crud<T>{
  private filePath: string
  private data = new Map<string, string>()

  constructor(filePath: string) {
    this.filePath = filePath
    this.loadData()
  }

  private loadData() {
    fs.readFile(this.filePath, 'utf-8', (fileData) => {
      const list = JSON.parse('[' + fileData + ']') as T[]
      let requireCompact = false
      for (const t of list) {
        if (!t || !t.id) continue
        const old = this.getById(t.id)
        if (old) {
          requireCompact = true
        }
        if (!old || (t._v || 0) > (old._v || 0)) {
          this.data.set(t.id, JSON.stringify(t))
        }
      }
      if (requireCompact) {
        this.compact()
      }
    })
  }

  private compact() {
    lock.acquire(this.filePath, (done) => {
      const list = Array.from(this.data.values()).join(',')
      fs.writeFile(this.filePath, list, done)
    })
  }

  getAll(): T[] {
    return Array.from(this.data.values(), (d) => JSON.parse(d))
  }

  getById(id: string): T | undefined {
    const s = this.data.get(id)
    return s ? JSON.parse(s) : null
  }

  upsert(t: T): string {
    const old = this.getById(t.id)
    if (old && t._v !== old._v) {
      throw new Error('version conflict')
    }

    t._v = (old?._v || 0) + 1
    const line = JSON.stringify(t, null, 2)
    lock.acquire(this.filePath, (done) => {
      this.data.set(t.id, line)
      fs.appendFile(this.filePath, ',' + line, done)
    })
    return t.id
  }
}
