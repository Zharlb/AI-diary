import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Calendar',
        component: () => import('@/components/CalendarPage.vue'),
        meta: { title: '日历日记', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/components/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: 'manage_users' }
      },
      {
        path: 'quickoptions',
        name: 'QuickOptions',
        component: () => import('@/components/QuickOptionsManager.vue'),
        meta: { title: '快捷选项管理', requiresAuth: true, permission: 'manage_quickoptions' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }
  
  if (to.path === '/login' && isLoggedIn) {
    next('/')
    return
  }
  
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next('/')
    return
  }
  
  next()
})

export default router