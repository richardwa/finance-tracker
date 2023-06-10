import { getJson, listFiles, saveFile } from './file-service'
import { v4 as uuidv4 } from 'uuid'

export type PageKey = {
  readonly id: string
  readonly page: string
  version: number
}

const jsonReplacer = (key: string, value: any) => {
  if (key.startsWith('__')) return undefined
  else return value
}
export const stringify = (o: any) => JSON.stringify(o, jsonReplacer, 2)

export class PersistanceCollection<T extends PageKey> {
  collection: string
  constructor(collection: string) {
    this.collection = collection
  }

  async _getPage(name: string) {
    const fileInfo = await getJson<{ [s: string]: T }>(`${this.collection}/${name}`)
    return fileInfo
  }

  async listAll(): Promise<T[]> {
    const { files } = await listFiles(this.collection)
    const pages: T[] = []
    for (const f of files) {
      const page = await this._getPage(f)
      pages.push(...Object.values(page.file))
    }
    return pages
  }

  // concurrent version is slower than sequential.  probably some issue with apache config
  // async listAll(): Promise<T[]> {
  //   const { files } = await listFiles(this.collection)
  //   const pages = await Promise.all(files.map((f) => this._getPage(f)))
  //   return pages.flatMap((p) => Object.values(p.file))
  // }

  createNew() {
    // yyyy-MM-dd Canadian date format is sensible
    const date = new Date().toLocaleDateString('en-CA')
    return {
      id: uuidv4(),
      page: date.substring(0, 7) // new page every month
    } as T
  }

  save(t: T[]) {
    const groups = t.reduce((a: { [s: string]: T[] }, v) => {
      if (!a[v.page]) {
        a[v.page] = []
      }
      a[v.page].push(v)
      return a
    }, {})

    Object.entries(groups).forEach(async ([page, items]) => {
      const path = `${page}.json`
      const db = await this._getPage(path)
      let update: boolean = false
      items.forEach((i) => {
        const old = db.file[i.id]
        if (!old || (old.version || 0) === (i.version || 0)) {
          i.version = (i.version || 0) + 1
          db.file[i.id] = i
          update = true
        } else {
          console.error('version conflict', i.id, i.page, old.version, i.version)
        }
      })
      if (update) {
        saveFile(`${this.collection}/${path}`, stringify(db.file), db.lastModified)
      }
    })
  }
}
