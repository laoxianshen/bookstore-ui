/**
 * 购物车状态管理（Pinia Store）
 *
 * 购物车数据完全由后端维护（cart_item 表），
 * 每次操作后自动从服务端重新拉取最新数据，确保：
 * - 库存信息的实时性（每次拉取附带当前库存数）
 * - 多端同步的可行性（数据在服务端，不在 localStorage）
 *
 * 对应后端 API：/api/cart/*
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItemDto } from '@/types'
import {
  fetchCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi,
} from '@/api/order'

export const useCartStore = defineStore('cart', () => {
  /** 购物车条目列表 */
  const items = ref<CartItemDto[]>([])

  /** 购物车商品总件数 */
  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  /** 购物车商品总金额（使用后端计算好的 subtotal 累加） */
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.subtotal, 0)
  )

  /** 从服务端拉取最新购物车数据 */
  async function fetchCart() {
    try {
      const res = await fetchCartApi()
      items.value = res.data.data
    } catch {
      // 未登录或其他错误时清空本地列表
      items.value = []
    }
  }

  /**
   * 添加商品到购物车
   * 后端自动处理重复商品的数量合并（依靠 DB 唯一约束）
   */
  async function addToCart(bookId: number, quantity: number = 1) {
    await addToCartApi(bookId, quantity)
    await fetchCart()
  }

  /** 从购物车中移除商品 */
  async function removeFromCart(cartItemId: number) {
    await removeCartItemApi(cartItemId)
    await fetchCart()
  }

  /**
   * 更新购物车商品数量
   * 数量 <= 0 时后端自动删除该条目
   */
  async function updateQuantity(cartItemId: number, quantity: number) {
    await updateCartItemApi(cartItemId, quantity)
    await fetchCart()
  }

  /** 清空购物车（下单后由后端自动调用） */
  async function clearCart() {
    await clearCartApi()
    items.value = []
  }

  return {
    items,
    totalCount,
    totalPrice,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }
})
