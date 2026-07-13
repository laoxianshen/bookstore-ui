/**
 * Vue Router 路由配置
 *
 * 路由结构：
 *   /login, /register   — 登录/注册（游客可访问）
 *   /                   — 前台布局（DefaultLayout）
 *     /                  — 首页（图书列表）
 *     /books/:id         — 图书详情
 *     /cart              — 购物车（需登录）
 *     /orders            — 我的订单（需登录）
 *     /profile           — 个人中心（需登录）
 *   /admin              — 后台布局（AdminLayout，需管理员）
 *     /admin             — 仪表盘
 *     /admin/books       — 图书管理
 *     /admin/orders      — 订单管理
 *     /admin/users       — 用户管理
 *
 * 路由守卫逻辑：
 *   1. guest 路由：已登录用户访问登录/注册页 → 重定向到首页
 *   2. requiresAuth 路由：未登录 → 重定向到登录页
 *   3. requiresAdmin 路由：非管理员 → 重定向到首页
 *
 * 注意：前端路由守卫仅做 UX 优化（避免白屏），
 *       真正的权限校验由后端 Session 拦截器完成。
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getStorage } from '@/utils/storage'
import type { User } from '@/types'

const routes: RouteRecordRaw[] = [
  // ==================== 认证页面（游客可访问） ====================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true }, // 已登录用户自动跳转到首页
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true },
  },

  // ==================== 前台页面（DefaultLayout） ====================
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/books/BookListView.vue'),
      },
      {
        path: 'books/:id',
        name: 'BookDetail',
        component: () => import('@/views/books/BookDetailView.vue'),
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/cart/CartView.vue'),
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: 'orders',
        name: 'MyOrders',
        component: () => import('@/views/orders/OrderListView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/books/FavoritesView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  // ==================== 后台管理页面（AdminLayout，需管理员权限） ====================
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
      },
      {
        path: 'books',
        name: 'BookManage',
        component: () => import('@/views/admin/BookManageView.vue'),
      },
      {
        path: 'orders',
        name: 'OrderManage',
        component: () => import('@/views/admin/OrderManageView.vue'),
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('@/views/admin/UserManageView.vue'),
      },
      {
        path: 'banners',
        name: 'BannerManage',
        component: () => import('@/views/admin/BannerManageView.vue'),
      },
      {
        path: 'announcements',
        name: 'AnnouncementManage',
        component: () => import('@/views/admin/AnnouncementManageView.vue'),
      },
      {
        path: 'reviews',
        name: 'ReviewManage',
        component: () => import('@/views/admin/ReviewManageView.vue'),
      },
      {
        path: 'coupons',
        name: 'CouponManage',
        component: () => import('@/views/admin/CouponManageView.vue'),
      },
    ],
  },
]

const router = createRouter({
  /** 使用 HTML5 History 模式（需后端配合将未匹配路径 fallback 到 index.html） */
  history: createWebHistory(),
  routes,
})

/**
 * 全局前置守卫
 * 根据 localStorage 中缓存的用户信息判断权限
 */
router.beforeEach((to, _from, next) => {
  const user = getStorage<User | null>('currentUser', null)

  // 已登录用户访问登录/注册页 → 重定向到首页
  if (to.meta.guest && user && user.status === 1) {
    return next('/')
  }

  // 需要登录的页面 → 未登录则跳转到登录页
  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  // 需要管理员权限的页面 → 非管理员跳转到首页
  if (to.meta.requiresAdmin && user?.role !== 1) {
    return next('/')
  }

  next()
})

export default router
