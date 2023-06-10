<script setup lang="ts">
import { ref, watch } from 'vue'
import { useInventoryStore } from '@/client/stores/inventory-store'
import { getLastestDate, getYearlyReport, months, type Summary } from '@/client/stores/report-service'
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto'

const { store } = storeToRefs(useInventoryStore())
const elemRef = ref<HTMLCanvasElement | null>(null)
const summary = ref<Summary[]>([])

watch([elemRef, store], () => {
  if (!(elemRef.value && store.value && store.value.length > 0)) return

  const yearsAgo = new Date().getFullYear() - 2
  const yearsAgoStr = yearsAgo.toString()
  const rowData = Object.values(store.value).filter(
    (r) => !r.deleted && getLastestDate(r) > yearsAgoStr
  )
  summary.value = getYearlyReport(rowData)
  new Chart(elemRef.value, {
    type: 'bar',
    data: {
      labels: months,
      datasets: summary.value.map((s, i) => ({
        label: `[${yearsAgo + i}] $${s.sum.toLocaleString(undefined, {
          maximumFractionDigits: 0
        })}  `,
        data: s.data,
        borderWidth: 1
      }))
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 22
            }
          }
        }
      }
    }
  })
})
</script>

<template>
  <main class="v-box">
    <canvas ref="elemRef"></canvas>
  </main>
</template>
<style module></style>
