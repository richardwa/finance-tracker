import type { ParentItem } from '@/common/types'

export const filterValues = <T extends ParentItem>(term: string, list: T[]) => {
  if (!term || term === '') {
    return list
  }
  const lowered = term.toLowerCase()
  const filtered = list.filter((o: T) => {
    const { _children, ...rest } = o
    if (JSON.stringify(Object.values(rest)).toLowerCase().indexOf(lowered) >= 0) {
      return true
    }
    for (const item in _children) {
      if (JSON.stringify(Object.values(item)).toLowerCase().indexOf(lowered) >= 0) {
        return true
      }
    }
    return false
  })
  return filtered
}

export const format = (d: Date) => d.toLocaleDateString('en-CA')

export const imagePasteService = (() => {
  const subscribers: Array<(b: File) => void> = []
  const onPaste = (e: ClipboardEvent) => {
    if (e.clipboardData) {
      const items = e.clipboardData.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          // console.log('imaged pasted')
          const blob = items[i].getAsFile()
          subscribers.forEach((cb) => {
            if (blob) {
              cb(blob)
            }
          })
        }
      }
    }
  }
  return {
    subscribe: (cb: (s: File) => void) => {
      document.addEventListener('paste', onPaste)
      subscribers.push(cb)
    },
    unsubscribe: (cb: (s: File) => void) => {
      const i = subscribers.indexOf(cb)
      if (i >= 0) {
        subscribers.splice(i, 1)
      }
    }
  }
})()
