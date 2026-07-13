/**
 * 用户认证状态管理（Pinia Store）
 *
 * 认证机制说明：
 * 后端使用 HttpSession 认证（非 JWT）。
 * - 登录成功后，后端将 User 对象存入 Session 并返回 Set-Cookie
 * - 后续请求由浏览器自动携带 Session Cookie
 * - 前端在 localStorage 中存储一份用户信息副本，用于：
 *   ① 路由守卫快速判断登录状态（避免每次发起 HTTP 请求）
 *   ② UI 组件中展示用户信息
 *
 * 对应后端 API：/api/auth/*
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginForm, RegisterForm, UpdateProfileForm } from '@/types'
import {
  loginApi, registerApi, logoutApi, fetchProfileApi, updateProfileApi,
} from '@/api/auth'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  /** 当前登录用户（从 localStorage 恢复初始值，页面刷新后保持登录态） */
  const user = ref<User | null>(getStorage<User | null>('currentUser', null))

  /** 是否已登录且账号状态正常 */
  const isLoggedIn = computed(() => user.value !== null && user.value.status === 1)
  /** 是否为管理员（role === 1） */
  const isAdmin = computed(() => user.value?.role === 1)
  /** 当前用户ID */
  const userId = computed(() => user.value?.id ?? 0)

  /**
   * 用户登录
   * 成功后同步更新 state + localStorage，并设置后端 Session
   */
  async function login(form: LoginForm) {
    const res = await loginApi(form)
    user.value = res.data.data.user
    setStorage('currentUser', res.data.data.user)
    return user.value
  }

  /**
   * 用户注册
   * 注册成功自动登录
   */
  async function register(form: RegisterForm) {
    const res = await registerApi(form)
    user.value = res.data.data.user
    setStorage('currentUser', res.data.data.user)
    return user.value
  }

  /**
   * 从服务端拉取最新的用户信息
   * 用于个人中心页面刷新或更新后同步
   */
  async function fetchProfile() {
    const res = await fetchProfileApi()
    user.value = res.data.data
    setStorage('currentUser', res.data.data)
    return user.value
  }

  /**
   * 更新个人资料（邮箱、手机号）
   */
  async function updateProfile(data: UpdateProfileForm) {
    const res = await updateProfileApi(data)
    user.value = res.data.data
    setStorage('currentUser', res.data.data)
    return user.value
  }

  /**
   * 退出登录
   * 调用后端销毁 Session，清除本地所有用户数据
   */
  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 即使后端调用失败，也应清除本地状态
    }
    user.value = null
    removeStorage('currentUser')
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    userId,
    login,
    register,
    fetchProfile,
    updateProfile,
    logout,
  }
})
