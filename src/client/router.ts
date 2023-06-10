import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/client/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory('#'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/client/views/InventoryView.vue')
    },
    {
      path: '/inventoryReport',
      name: 'report',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/client/views/InventoryReport.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/client/views/SettingsView.vue')
    }
  ]
})

