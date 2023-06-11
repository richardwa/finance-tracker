import type { UIParentItem } from '@/common/types'
import { groupBy } from 'lodash/fp'

export const netIncome = (item: UIParentItem): number => {
  const hasChildren = item._children && item._children.length > 0
  if (item.source === 'expense' && !hasChildren) {
    return item.price || 0
  } else if (hasChildren) {
    const sum = item._children.reduce((a, v) => a + (v.price || 0), 0)
    return (item.price || 0) + sum
  } else {
    return NaN
  }
}

export const getLastestDate = (item: UIParentItem) => {
  let latest = item.date || ''
  if (item._children) {
    for (const c of item._children) {
      if (c.date && c.date > latest) {
        latest = c.date
      }
    }
  }
  return latest
}

export type Summary = {
  name: string
  data: number[]
  sum: number
}

const sumReducer = (a: number, v: number) => a + (isNaN(v) ? 0 : v)
const getMetrics = (name: string, data: number[]): Summary => {
  const sum = data.reduce(sumReducer, 0)
  return { name, data, sum }
}

export const getYearlyReport = (rowData: UIParentItem[]) => {
  const monthly = getMonthlyReport(rowData)
  const summary = groupBy((m) => m.name.substring(0, 4), monthly)
  return Object.entries(summary).map(([key, val]) => {
    const data: number[] = []
    val.forEach((v) => {
      const month = parseInt(v.name.substring(5, 8)) - 1
      data[month] = v.sum
    })
    return getMetrics(key, data)
  })
}

export const getMonthlyReport = (rowData: UIParentItem[]): Summary[] => {
  const monthly = groupBy((r) => getLastestDate(r).substring(0, 7), rowData)
  return Object.entries(monthly).map(([key, group]) => {
    const data = group.map(netIncome)
    return getMetrics(key, data)
  })
}

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
