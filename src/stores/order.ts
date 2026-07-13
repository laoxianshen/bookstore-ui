/**
 * 订单状态管理（Pinia Store）
 *
 * 管理用户订单列表和管理端全部订单的查询与状态更新。
 *
 * 对应后端 API：/api/orders, /api/admin/orders
 * 下单流程：
 *   1. 用户填写收货地址 → placeOrderApi
 *   2. 后端事务操作：校验库存 → 扣减库存 → 生成订单快照 → 清空购物车
 *   3. 前端刷新购物车和订单列表
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, Address } from '@/types'
import {
  placeOrderApi, fetchMyOrdersApi, fetchAllOrdersApi, updateOrderStatusApi,
} from '@/api/order'
import { useCartStore } from './cart'

export const useOrderStore = defineStore('order', () => {
  /** 当前用户的订单列表 */
  const orders = ref<Order[]>([])
  /** 管理端全部订单列表 */
  const allOrders = ref<Order[]>([])
  /** 当前查询条件下的总记录数 */
  const total = ref(0)

  /** 获取当前用户的订单列表 */
  async function fetchMyOrders(page: number = 1) {
    const res = await fetchMyOrdersApi(page)
    orders.value = res.data.data.list
    total.value = res.data.data.total
  }

  /**
   * 提交订单
   * 下单成功后自动刷新购物车（清空）和订单列表
   */
  async function createOrder(address: Address) {
    const cart = useCartStore()
    const res = await placeOrderApi(address)
    // 下单成功后购物车已被后端清空，重新拉取以同步
    await cart.fetchCart()
    await fetchMyOrders()
    return res.data.data
  }

  /** 更新订单状态（管理员） */
  async function updateOrderStatus(id: number, status: number) {
    await updateOrderStatusApi(id, status)
    await fetchAllOrdersAdmin()
  }

  /** 获取全部订单列表（管理员，分页） */
  async function fetchAllOrdersAdmin(page: number = 1, size: number = 10) {
    const res = await fetchAllOrdersApi({ page, size })
    allOrders.value = res.data.data.list
    total.value = res.data.data.total
  }

  return {
    orders,
    allOrders,
    total,
    fetchMyOrders,
    createOrder,
    updateOrderStatus,
    fetchAllOrdersAdmin,
  }
})
