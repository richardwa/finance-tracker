import { createRouter, createWebHistory } from 'vue-router'

export const staticPaths = {
  list: '/',
  inventory: '/inventory',
  report: '/report',
  settings: '/settings'
}

export const router = createRouter({
  history: createWebHistory('#'),
  routes: [
    {
      path: staticPaths.inventory,
      name: 'inventory',
      component: () => import('@/client/views/InventoryView.vue')
    },
    {
      path: staticPaths.report,
      name: 'report',
      component: () => import('@/client/views/InventoryReport.vue')
    },
    {
      path: staticPaths.settings,
      name: 'settings',
      component: () => import('@/client/views/SettingsView.vue')
    },
    {
      path: '/:catchAll(.*)',
      redirect: staticPaths.inventory
    }
  ]
})
