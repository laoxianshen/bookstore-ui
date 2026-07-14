<!--
  前台布局组件（DefaultLayout）

  结构：
  - Header：导航栏，包含 Logo、菜单、购物车角标、用户下拉菜单
  - Main：router-view 内容区域
  - Footer：版权信息

  认证逻辑：
  - 未登录：显示"登录/注册"按钮
  - 已登录：显示用户头像下拉菜单（我的订单/个人中心/后台管理/退出）
  - 管理员：额外显示"后台管理"入口
-->

<template>
  <el-container class="layout-default">
    <!-- ==================== 顶部导航栏 ==================== -->
    <el-header class="header">
      <div class="header-left">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <el-icon :size="28"><Reading /></el-icon>
          <span class="logo-text">BookStore</span>
        </router-link>
        <!-- 导航菜单 -->
        <el-menu
          :default-active="currentPath"
          mode="horizontal"
          :ellipsis="false"
          class="header-menu"
          router
        >
          <el-menu-item index="/">首页</el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧：购物车 + 用户信息 -->
      <div class="header-right">
        <!-- 购物车角标 -->
        <router-link to="/cart" class="cart-link">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <UiButton :icon="ShoppingCartFull" circle />
          </el-badge>
        </router-link>

        <!-- 已登录：用户下拉菜单 -->
        <template v-if="authStore.isLoggedIn">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32">{{ authStore.user?.username?.[0] }}</el-avatar>
              <span class="nickname">{{ authStore.user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/orders')">我的订单</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/favorites')">我的收藏</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/profile')">个人中心</el-dropdown-item>
                <!-- 管理员可见 -->
                <el-dropdown-item v-if="authStore.isAdmin" @click="$router.push('/admin')" divided>
                  后台管理
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <!-- 未登录 -->
        <template v-else>
          <UiButton @click="$router.push('/login')">登录</UiButton>
          <UiButton type="primary" @click="$router.push('/register')">注册</UiButton>
        </template>
      </div>
    </el-header>

    <!-- ==================== 内容区域 ==================== -->
    <el-main class="main-content">
      <router-view />
    </el-main>

    <!-- ==================== 页脚 ==================== -->
    <el-footer class="footer">
      <p>&copy; 2024 BookStore 网上书城 - 版权所有</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCartFull, ArrowDown, Reading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { fetchCartCountApi } from '@/api/order'
import { ElMessage } from 'element-plus'
import { UiButton } from '@bookstore/ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

/** 购物车商品数量（用于 Header 角标） */
const cartCount = ref(0)

/** 当前路由路径（用于菜单高亮） */
const currentPath = computed(() => route.path)

/** 组件挂载时，已登录则拉取购物车数量 */
onMounted(async () => {
  if (authStore.isLoggedIn) {
    try {
      const res = await fetchCartCountApi()
      cartCount.value = res.data.data
    } catch { /* ignore */ }
  }
})

/** 退出登录：调用后端销毁 Session，清除本地状态，跳转首页 */
function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #409eff;
  font-weight: bold;
}

.logo-text {
  font-size: 20px;
  letter-spacing: 1px;
}

.header-menu {
  border-bottom: none !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-link {
  text-decoration: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.nickname {
  font-size: 14px;
  color: #333;
}

.main-content {
  flex: 1;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.footer {
  text-align: center;
  color: #909399;
  font-size: 13px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}
</style>
