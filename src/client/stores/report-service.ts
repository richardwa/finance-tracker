import { groupBy } from 'lodash-es'
import type { ParentItem } from './inventory-store'

export const netIncome = (item: ParentItem) => {
  const hasChildren = item._children && item._children.length > 0
  if (item.source === 'expense' && !hasChildren) {
    return item.price
  } else if (hasChildren) {
    const sum = item._children.reduce((a, v) => a + v.price || 0, 0)
    return item.price + sum
  } else {
    return NaN
  }
}

export const getLastestDate = (item: ParentItem) => {
  let latest = item.date
  if (item._children) {
    for (const c of item._children) {
      if (c.date > latest) {
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

export const getYearlyReport = (rowData: ParentItem[]) => {
  const monthly = getMonthlyReport(rowData)
  const summary = groupBy(monthly, (m) => m.name.substring(0, 4))
  return Object.entries(summary).map(([key, val]) => {
    const data: number[] = []
    val.forEach((v) => {
      const month = parseInt(v.name.substring(5, 8)) - 1
      data[month] = v.sum
    })
    return getMetrics(key, data)
  })
}

export const getMonthlyReport = (rowData: ParentItem[]): Summary[] => {
  const monthly = groupBy(rowData, (r) => getLastestDate(r).substring(0, 7))
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
