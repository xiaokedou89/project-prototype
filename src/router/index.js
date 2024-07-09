import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/home.vue')
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/Test.vue')
      // component: () => import('@/page/login1.vue')  
      // component: () => import('@/page/login2.vue')
      // component: () => import('@/page/login3.vue')
      // component: () => import('@/page/login4.vue')
    }
  ]
})

export default router
