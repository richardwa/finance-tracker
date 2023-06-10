import { createRouter, createWebHashHistory } from 'vue-router'
import HelloClientVue from '@/client/views/HelloClient.vue'

const staticPaths = {
  home: '/',
  hello: '/hello'
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: staticPaths.home,
      name: 'home',
      component: HelloClientVue
    },
    {
      path: staticPaths.hello,
      name: 'hello',
      component: () => import('@/client/views/HelloServer.vue')
    }
  ]
})

export { router, staticPaths }
