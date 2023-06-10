import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('#'),
  routes: [
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/client/views/InventoryView.vue')
    },
    {
      path: '/inventoryReport',
      name: 'report',
      component: () => import('@/client/views/InventoryReport.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/client/views/SettingsView.vue')
    }
  ]
})
