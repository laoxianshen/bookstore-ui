/**
 * 管理后台 API 模块
 *
 * 对应后端：com.bookstore.controller.api.AdminRestController
 * 所有接口需要管理员权限（Session 中 user.role === 1）
 */

import http from './index'
import type { ApiResponse, DashboardData, PageResult, User } from '@/types'

/**
 * 获取仪表盘统计数据
 * GET /api/admin/dashboard
 * 包含：图书/订单/用户总数、总营收、销售趋势、分类分布、最近订单
 */
export function fetchDashboardDataApi() {
  return http.get<ApiResponse<DashboardData>>('/admin/dashboard')
}

/**
 * 分页获取用户列表（管理员）
 * GET /api/admin/users
 * 返回数据已由后端移除 password 字段
 */
export function fetchUsersApi(params: { page?: number; size?: number }) {
  return http.get<ApiResponse<PageResult<User>>>('/admin/users', { params })
}

/**
 * 切换用户启用/禁用状态（管理员）
 * PUT /api/admin/users/{id}/status
 * @param status 0=禁用, 1=启用
 */
export function updateUserStatusApi(id: number, status: number) {
  return http.put<ApiResponse>(`/admin/users/${id}/status`, { status })
}

/**
 * 删除用户（管理员）
 * DELETE /api/admin/users/{id}
 */
export function deleteUserApi(id: number) {
  return http.delete<ApiResponse>(`/admin/users/${id}`)
}
