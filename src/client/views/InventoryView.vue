<script setup lang="ts">
import ImageContainer from '@/client/components/ImageContainer.vue'
import { saveFile, saveImage } from '@/client/stores/file-service'
import {
  getLastestDate,
  getMonthlyReport,
  netIncome,
  type Summary
} from '@/client/stores/report-service'
import { filterValues, format, imagePasteService } from '@/client/util'
import { storeToRefs } from 'pinia'
import type { CellComponent, ColumnDefinition, RowComponent } from 'tabulator-tables'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { onMounted, ref, watch, useCssModule, onUnmounted } from 'vue'
import type { ParentItem, ChildItem } from '@/common/types'
import { useInventoryStore } from '@/client/stores/inventory-store'
const inventoryStore = useInventoryStore()

const style = useCssModule()
const { store } = storeToRefs(inventoryStore)
const gridRef = ref<HTMLElement | null>(null)
let grid: Tabulator
const filter = ref<string>('')
const selected = ref<{ item: ChildItem | ParentItem; parent: ParentItem }>()
const summary = ref<Summary[]>([])

const updateGrid = () => {
  if (grid) {
    const inventory = store.value
    const rowData = Object.values(inventory).filter((r) => !r.deleted)
    const d = new Date()
    d.setMonth(d.getMonth() - 2)
    const monthsAgo = format(d)
    summary.value = getMonthlyReport(rowData.filter((r) => getLastestDate(r) > monthsAgo))
    const filtered = filterValues(filter.value, rowData)
    grid.replaceData(filtered)
    grid.rowManager.refreshActiveData('all')
  }
}
watch([filter, store], updateGrid)
watch(selected, () => {
  grid.deselectRow()
  const row = grid.getRows().find((r) => r.getData() === selected.value?.item)
  if (row) {
    row.select()
  } else {
    const parentRow = grid.getRows().find((r) => r.getData() === selected.value?.parent)
    const child = parentRow?.getTreeChildren().find((r) => r.getData() === selected.value?.item)
    child?.select()
  }
})

const columns = (): ColumnDefinition[] =>
  (
    [
      {
        width: '1rem',
        title: '',
        headerSort: false
      },
      {
        width: '5rem',
        title: `<button class="${style.button}">+Row</button>`,
        hozAlign: 'right',
        headerHozAlign: 'right',
        headerClick: () => {
          const item = inventoryStore.addRow()
          grid?.addData([item], true)
        },
        headerSort: false,
        formatter: (cell, _params) => {
          const item = cell.getData() as ParentItem | ChildItem
          if ('_children' in item) {
            return `<button class="${style.button}">+Sell</button>`
          }
          return ''
        },
        cellClick: (_ev, cell) => {
          const item = cell.getData() as ParentItem | ChildItem
          if ('_children' in item) {
            inventoryStore.addChildTo(item).then(() => {
              cell.getRow().update(item)
            })
          }
        }
      },
      {
        title: 'Price',
        field: 'price',
        width: '8rem',
        hozAlign: 'right',
        editor: 'number',
        formatter: 'money',
        formatterParams: {
          decimal: '.',
          thousand: ',',
          precision: 2
        },
        mutator: (value: any, data: any) => {
          return '_children' in data && value ? Math.abs(value) * -1 : value
        },
        cellEdited: (cell) => {
          const row = cell.getRow()
          const parent = row.getTreeParent() || row
          parent.update({})
        }
      },
      {
        title: 'Net',
        field: '__net',
        width: '8rem',
        hozAlign: 'right',
        sorter: 'number',
        mutator: (value, data, type, params, cell) => {
          const item = data as ParentItem | ChildItem
          if ('_children' in item) {
            const net = netIncome(item)
            return isNaN(net) ? '' : net.toFixed(2)
          }
        }
      },
      {
        title: 'Date',
        field: 'date',
        width: '10rem',
        editor: 'date',
        sorter: (a, b, aRow, bRow, column, dir, sorterParams) => {
          const d1 = getLastestDate(aRow.getData() as ParentItem)
          const d2 = getLastestDate(bRow.getData() as ParentItem)
          return d1.localeCompare(d2)
        },
        editorParams: {
          format: 'yyyy-MM-dd'
        }
      },
      {
        title: 'Source',
        field: 'source',
        width: '10rem',
        hozAlign: 'left',
        editor: 'input'
      },
      {
        title: 'Title',
        field: 'title',
        width: '25rem',
        hozAlign: 'left',
        headerHozAlign: 'center',
        editor: 'input'
      },
      {
        title: 'Img',
        field: 'images',
        width: '3rem',
        headerSort: false,
        editable: false,
        formatter: (cell, _formatterParams, _onRendered) => {
          const data = cell.getValue() as string[]
          return data && data.length > 0 ? `${data.length}` : ''
        }
      },
      {
        title: 'Notes',
        field: 'notes',
        width: '15rem',
        hozAlign: 'left',
        headerHozAlign: 'center',
        editor: 'input'
      }
    ] as ColumnDefinition[]
  ).map((c) => ({
    editable: true,
    resizable: false,
    hozAlign: 'center',
    headerHozAlign: 'center',
    ...c
  }))

const processDelete = (file: string) => {
  if (grid && selected.value) {
    const item = selected.value.item
    const i = item.images.indexOf(file)
    item.images.splice(i, 1)
    const parent = '_children' in item ? item : store.value.find((p) => p._children.includes(item))
    if (parent) {
      inventoryStore.save(parent)
      updateGrid()
    } else {
      console.error('unable to find parent data')
    }
  }
}

const processFiles = async (...s: File[]) => {
  console.log('got files', s)
  const n = await saveImage(...s)
  if (grid && selected.value) {
    const item = selected.value.item
    if (!item.images) {
      item.images = []
    }
    item.images = [...item.images, ...n]
    const parent = '_children' in item ? item : store.value.find((p) => p._children.includes(item))
    if (parent) {
      inventoryStore.save(parent)
      updateGrid()
    } else {
      console.error('unable to find parent data')
    }
  }
}
onUnmounted(() => {
  imagePasteService.unsubscribe(processFiles)
})
onMounted(() => {
  imagePasteService.subscribe(processFiles)

  if (gridRef.value) {
    const _grid = new Tabulator(gridRef.value, {
      dataTree: true,
      dataTreeStartExpanded: false,
      dataTreeCollapseElement: `<span class="${style.treeCollapse}">▽</span>`,
      dataTreeExpandElement: `<span class="${style.treeExpand}">▷</span>`,
      rowFormatter: (row) => {
        const children = row.getData()._children
        if (children && children.length === 0) {
          row.getElement().classList.add(style.nochildren)
        } else {
          row.getElement().classList.remove(style.nochildren)
        }
      },
      selectable: false,
      columns: columns(),
      rowContextMenu: [
        {
          label: 'Delete Row',
          action: function (e, row) {
            selected.value = undefined
            grid.deselectRow()
            const parentRow = row.getTreeParent() || row
            const parent = parentRow.getData() as ParentItem
            if (row === parentRow) {
              parent.deleted = true
              inventoryStore.save(parent).then(() => {
                row.delete()
              })
            } else {
              const data = row.getData()
              const find = parent._children.indexOf(data)
              parent._children.splice(find, 1)
              inventoryStore.save(parent)
              parentRow.update(parent)
            }
          }
        }
      ]
    })

    let currentEditingCell: CellComponent
    _grid.on('rowClick', (e: Event, row: RowComponent) => {
      const item = row.getData() as ChildItem
      const parent = (row.getTreeParent() || row).getData()
      selected.value = { item, parent }
    })
    _grid.on('rowContext', (e: Event, row: RowComponent) => {
      currentEditingCell?.cancelEdit()
      const item = row.getData() as ChildItem
      const parent = (row.getTreeParent() || row).getData()
      selected.value = { item, parent }
    })
    _grid.on('cellEditing', (params) => {
      currentEditingCell = params
    })

    _grid.on('cellEdited', (params) => {
      if (params.getValue() != params.getOldValue()) {
        const row = params.getRow()
        const parentRow = row.getTreeParent() || row
        const item = parentRow.getData() as ParentItem
        inventoryStore.save(item)
      }
    })

    _grid.on('tableBuilt', () => {
      grid = _grid
      _grid.setSort('date', 'desc')
      updateGrid()
    })
  }
})
</script>

<template>
  <main :class="$style.container">
    <div class="h-box center">
      <input v-model="filter" :class="$style.filter" placeholder="filter rows" />
      <span :class="$style.pad" v-for="s in summary" :key="s.name">{{
        `[${s.name}]: $${s.sum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      }}</span>
    </div>
    <div ref="gridRef" :class="$style.grid"></div>
    <ImageContainer :selected="selected?.item" @file="processFiles" @delete="processDelete" />
  </main>
</template>
<style module>
.pad {
  padding: 1rem;
}
.nochildren .treeCollapse,
.nochildren .treeExpand {
  visibility: hidden;
}
.treeCollapse {
  cursor: pointer;
  display: inline-block;
  width: 1rem;
}
.treeExpand {
  cursor: pointer;
  display: inline-block;
  width: 1rem;
}
.button {
  width: 3rem;
}
.container {
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
}
.filter {
  border: 1px solid gray;
  border-radius: 2rem;
  padding: 0.2rem 0.7rem;
  margin: var(--gap);
}
.filter:focus {
  width: 25rem;
}
.grid {
  border-top: 1px solid gray;
  width: 100%;
  min-height: 20rem;
  height: 60vh;
}
</style>
<style>
.tabulator-row.tabulator-tree-level-0 {
  background-color: azure;
}
.tabulator-menu-item:hover {
  background-color: rgb(51, 51, 200) !important;
  color: white;
}
.tabulator-menu {
  padding: var(--gap);
}
</style>
