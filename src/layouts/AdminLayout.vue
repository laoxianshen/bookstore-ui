<template>
  <el-container class="layout-admin">
    <el-aside width="220px">
      <div class="aside-header">
        <el-icon :size="24"><Reading /></el-icon>
        <span>后台管理</span>
      </div>
      <el-menu
        :default-active="currentPath"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/admin">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/books">
          <el-icon><Notebook /></el-icon>
          <span>图书管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/banners">
          <el-icon><PictureFilled /></el-icon>
          <span>轮播图</span>
        </el-menu-item>
        <el-menu-item index="/admin/announcements">
          <el-icon><Bell /></el-icon>
          <span>公告管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/reviews">
          <el-icon><ChatLineSquare /></el-icon>
          <span>评价管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/coupons">
          <el-icon><Tickets /></el-icon>
          <span>优惠券</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div class="admin-header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="admin-header-right">
          <el-button @click="$router.push('/')">
            <el-icon><HomeFilled /></el-icon>
            返回前台
          </el-button>
          <el-dropdown>
            <span class="admin-user-info">
              <el-avatar :size="32">{{ authStore.user?.username?.[0] }}</el-avatar>
              <span>{{ authStore.user?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Reading, DataAnalysis, Notebook, List, UserFilled, HomeFilled, PictureFilled, Bell, ChatLineSquare, Tickets } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentPath = computed(() => route.path)

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/admin': '仪表盘',
    '/admin/books': '图书管理',
    '/admin/orders': '订单管理',
    '/admin/users': '用户管理',
    '/admin/banners': '轮播图管理',
    '/admin/announcements': '公告管理',
    '/admin/reviews': '评价管理',
    '/admin/coupons': '优惠券管理',
  }
  return map[route.path] || '后台管理'
})

function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.layout-admin { height: 100vh; }
.el-aside { background-color: #304156; overflow: hidden; }
.aside-header { display: flex; align-items: center; gap: 10px; padding: 20px; color: #fff; font-size: 18px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); }
.el-menu { border-right: none; }
.admin-header { display: flex; align-items: center; justify-content: space-between; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); padding: 0 24px; }
.page-title { font-size: 16px; font-weight: 600; color: #303133; }
.admin-header-right { display: flex; align-items: center; gap: 16px; }
.admin-user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #333; }
.admin-main { background: #f5f7fa; overflow-y: auto; }
</style>
