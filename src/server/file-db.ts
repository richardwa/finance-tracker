import type { BaseDB, Crud } from '@/common/types'
import AsyncLock from 'async-lock'
import { filter, groupBy, map } from 'lodash/fp'
import path from 'path'
import sha1 from 'sha1'
import { promises as fs } from 'fs'

export type FileDBConfig<T> = {
  filePath: string
  onReady: () => void
  groupBy: (t: T) => string
}

const lock = new AsyncLock({ timeout: 5000 })
const stringify = (o: object) => JSON.stringify(o, null, 2)
export class FileDB<T extends BaseDB> implements Crud<T> {
  private folder: string
  // we cache our objects in string form to ensure immutability
  private data = new Map<string, string>()
  private onReady: () => void
  private groupBy: (t: T) => string
  private loadedFiles = new Set<string>()

  constructor({ filePath, onReady, groupBy }: FileDBConfig<T>) {
    this.folder = filePath
    this.onReady = onReady
    this.groupBy = groupBy
    this.loadData()
  }

  private async loadData() {
    const files = await fs
      .readdir(this.folder, { withFileTypes: true })
      .then(filter((f) => f.isFile()))
      .then(map((f) => f.name))
    let requireCompact = false
    const loading = files.map(async (f) => {
      this.loadedFiles.add(f)
      const contents = await fs.readFile(path.join(this.folder, f), { encoding: 'utf-8' })
      const list = JSON.parse(contents) as T[]
      for (const t of list) {
        if (!t || !t.id) continue
        const old = this.getById(t.id)
        if (old) {
          requireCompact = true
        }
        if (!old || (t._v || 0) > (old._v || 0)) {
          this.data.set(t.id, stringify(t))
        }
      }
    })
    await Promise.all(loading)
    console.log('loaded', this.data.size)

    this.onReady()
    if (requireCompact) {
      this.compact()
    }
  }

  private compact() {
    console.log('compacting')
    lock.acquire(this.folder, (done) => {
      type Pair = [T, string]
      const datas = Array.from(this.data.values(), (s) => [JSON.parse(s), s] as Pair)
      const groups = groupBy((t) => this.groupBy(t[0]), datas)
      const promises: Promise<void>[] = []
      const newFiles = new Set<string>()
      for (const k of Object.keys(groups)) {
        const pairs = groups[k]
        const json = `[${pairs.map((p) => p[1]).join(',')}]`
        const fileName = `${sha1(json)}.json`
        const filePath = path.join(this.folder, fileName)
        newFiles.add(fileName)
        const writeIfNotExists = fs
          .access(filePath)
          .catch(() => fs.writeFile(filePath, json))
          .then(() => {
            console.log('wrote', fileName, json.length)
          })
        promises.push(writeIfNotExists)
      }

      for (const f of this.loadedFiles) {
        if (!newFiles.has(f)) {
          const filePath = path.join(this.folder, f)
          promises.push(
            fs.unlink(filePath).then(() => {
              console.log('deleted', f)
            })
          )
        }
      }

      Promise.all(promises).then(() => {
        this.loadedFiles = newFiles
        done()
      })
    })
  }

  getAll(): T[] {
    return Array.from(this.data.values(), (d) => JSON.parse(d))
  }

  getById(id: string): T | undefined {
    const s = this.data.get(id)
    return s ? JSON.parse(s) : null
  }

  upsert(t: T): Promise<BaseDB> {
    return new Promise<BaseDB>((res, rej) => {
      const old = this.getById(t.id)
      lock.acquire(this.folder, (done) => {
        if (old && t._v !== old._v) {
          rej(`version conflict id: ${t.id}, old: ${old._v}, new: ${t._v}`)
        }
        const _v = (old?._v || 0) + 1
        const json = stringify([{ ...t, _v }])
        this.data.set(t.id, json)
        const fileName = `${sha1(json)}.json`
        const filePath = path.join(this.folder, fileName)
        fs.access(filePath)
          .catch(() => fs.writeFile(filePath, json))
          .then(() => {
            this.loadedFiles.add(fileName)
            const base = { id: t.id, _v }
            res(base)
            console.log('updated', base)
            done()
          })
      })
    })
  }
}
