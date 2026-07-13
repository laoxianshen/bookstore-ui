/**
 * 用户认证 API 模块
 *
 * 对应后端 RestController：com.bookstore.controller.api.AuthRestController
 * 所有接口前缀：/api/auth
 *
 * 认证机制：基于 HttpSession（非 JWT）
 * - 登录成功后，后端将 User 对象存入 Session
 * - 后续请求通过 Cookie 携带 Session ID 自动认证
 * - 退出登录时后端销毁 Session
 */

import http from './index'
import type { ApiResponse, LoginForm, RegisterForm, UpdateProfileForm, User } from '@/types'

/**
 * 用户登录
 * POST /api/auth/login
 * @returns { user } — 不含 password 字段的用户对象
 */
export function loginApi(data: LoginForm) {
  return http.post<ApiResponse<{ user: User }>>('/auth/login', data)
}

/**
 * 用户注册
 * POST /api/auth/register
 * 注册成功自动登录，返回用户信息
 */
export function registerApi(data: RegisterForm) {
  return http.post<ApiResponse<{ user: User }>>('/auth/register', data)
}

/**
 * 退出登录
 * POST /api/auth/logout
 * 后端销毁当前 HttpSession
 */
export function logoutApi() {
  return http.post<ApiResponse>('/auth/logout')
}

/**
 * 获取当前登录用户信息
 * GET /api/auth/profile
 * 需要登录状态（Session 中有 loginUser）
 */
export function fetchProfileApi() {
  return http.get<ApiResponse<User>>('/auth/profile')
}

/**
 * 更新个人资料（邮箱、手机号）
 * PUT /api/auth/profile
 */
export function updateProfileApi(data: UpdateProfileForm) {
  return http.put<ApiResponse<User>>('/auth/profile', data)
}

/**
 * 修改密码
 * PUT /api/auth/password
 * 需要验证旧密码
 */
export function updatePasswordApi(data: { oldPassword: string; newPassword: string }) {
  return http.put<ApiResponse>('/auth/password', data)
}
