/**
 * 购物车与订单 API 模块
 *
 * 对应后端：
 *   - 购物车：com.bookstore.controller.api.CartRestController        (/api/cart)
 *   - 订单：  com.bookstore.controller.api.OrderRestController       (/api/orders)
 *   - 管理端：com.bookstore.controller.api.AdminRestController       (/api/admin/orders)
 */

import http from './index'
import type { ApiResponse, Order, PageResult, CartItemDto, Address } from '@/types'

// ==================== 购物车接口 ====================

/**
 * 获取当前用户购物车列表
 * GET /api/cart
 * 后端 CartService 通过 JOIN 查询返回 CartItemDto 列表（含书名、单价、库存、小计）
 */
export function fetchCartApi() {
  return http.get<ApiResponse<CartItemDto[]>>('/cart')
}

/**
 * 添加商品到购物车
 * POST /api/cart/add
 * 如果商品已在购物车中，后端自动合并数量（依靠 DB 唯一约束）
 * @param bookId   图书ID
 * @param quantity 数量，默认1
 */
export function addToCartApi(bookId: number, quantity: number = 1) {
  return http.post<ApiResponse>('/cart/add', null, { params: { bookId, quantity } })
}

/**
 * 更新购物车商品数量
 * PUT /api/cart/{id}
 * 数量 <= 0 时后端自动删除该条目
 */
export function updateCartItemApi(id: number, quantity: number) {
  return http.put<ApiResponse>(`/cart/${id}`, null, { params: { quantity } })
}

/**
 * 删除购物车商品
 * DELETE /api/cart/{id}
 */
export function removeCartItemApi(id: number) {
  return http.delete<ApiResponse>(`/cart/${id}`)
}

/**
 * 清空购物车
 * DELETE /api/cart
 * 下单成功后由后端自动调用；也可手动调用
 */
export function clearCartApi() {
  return http.delete<ApiResponse>('/cart')
}

/**
 * 获取购物车商品种类数
 * GET /api/cart/count
 * 用于 Header 角标显示
 */
export function fetchCartCountApi() {
  return http.get<ApiResponse<number>>('/cart/count')
}

// ==================== 订单接口 ====================

/**
 * 提交订单
 * POST /api/orders/place
 * 后端事务操作：校验库存 → 扣减库存 → 生成订单快照 → 清空购物车
 */
export function placeOrderApi(data: Address) {
  return http.post<ApiResponse<Order>>('/orders/place', data)
}

/**
 * 获取当前用户订单列表（分页）
 * GET /api/orders
 */
export function fetchMyOrdersApi(page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Order>>>('/orders', { params: { page, size } })
}

/**
 * 获取订单详情（含订单明细）
 * GET /api/orders/{id}
 */
export function fetchOrderDetailApi(id: number) {
  return http.get<ApiResponse<Order>>(`/orders/${id}`)
}

// ==================== 管理端订单接口 ====================

/**
 * 获取全部订单列表（管理员）
 * GET /api/admin/orders
 */
export function fetchAllOrdersApi(params: { page?: number; size?: number }) {
  return http.get<ApiResponse<PageResult<Order>>>('/admin/orders', { params })
}

/**
 * 更新订单状态（管理员）
 * PUT /api/admin/orders/{id}/status
 * @param status 目标状态码：0=待付款,1=已付款,2=已发货,3=已完成,4=已取消
 */
export function updateOrderStatusApi(id: number, status: number) {
  return http.put<ApiResponse>(`/admin/orders/${id}/status`, { status })
}
