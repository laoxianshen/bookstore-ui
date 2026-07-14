<!--
  我的订单页面

  功能：展示当前用户的订单列表，每条包含订单号、状态、商品明细、收货地址和合计金额

  订单状态码（来自后端 OrderStatus 常量）：
    0 = 待付款  1 = 已付款  2 = 已发货  3 = 已完成  4 = 已取消
-->

<template>
  <div class="orders-page">
    <h2>我的订单</h2>

    <div v-if="orders.length > 0" class="order-list">
      <!-- 订单卡片 -->
      <div v-for="order in orders" :key="order.id" class="order-card">
        <!-- 订单头部：订单号 + 时间 + 状态标签 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号：{{ order.orderNo }}</span>
            <span class="order-time">{{ order.createTime }}</span>
          </div>
          <UiTag :type="statusType(order.status)">{{ statusLabel(order.status) }}</UiTag>
        </div>

        <!-- 订单商品明细 -->
        <div class="order-items" v-if="order.orderItems">
          <div v-for="item in order.orderItems" :key="item.id" class="order-item">
            <div class="item-info">
              <span class="item-name">{{ item.bookTitle }}</span>
              <span class="item-price">¥{{ Number(item.bookPrice).toFixed(2) }} × {{ item.quantity }}</span>
            </div>
            <span class="item-total">¥{{ Number(item.totalPrice).toFixed(2) }}</span>
          </div>
        </div>

        <!-- 订单底部：收货信息 + 合计 + 操作 -->
        <div class="order-footer">
          <div class="order-address">
            收货人：{{ order.receiverName }} {{ order.receiverPhone }}<br />
            地址：{{ order.receiverAddress }}
          </div>
          <div class="order-actions">
            <!-- 待付款：取消订单 -->
            <UiButton v-if="order.status === 0" type="warning" size="small" @click="handleRefund(order.id)">取消订单</UiButton>
            <!-- 已发货：确认收货 -->
            <UiButton v-if="order.status === 2" type="primary" size="small" @click="handleConfirm(order.id)">确认收货</UiButton>
            <!-- 已付款/已发货：申请退款 -->
            <UiButton v-if="order.status === 1 || order.status === 2" type="danger" size="small" plain @click="handleRefund(order.id)">申请退款</UiButton>
            <span class="order-total" style="margin-left:16px">
              合计：<strong>¥{{ Number(order.totalAmount).toFixed(2) }}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>

    <UiEmpty v-else description="还没有订单">
      <UiButton type="primary" @click="$router.push('/')">去逛逛</UiButton>
    </UiEmpty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { OrderStatusMap, OrderStatusTypeMap } from '@/types'
import { confirmReceiptApi, requestRefundApi } from '@/api/content'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UiButton, UiTag, UiEmpty } from '@bookstore/ui'

const orderStore = useOrderStore()
const orders = ref(orderStore.orders)

onMounted(async () => {
  await orderStore.fetchMyOrders()
  orders.value = orderStore.orders
})

function statusLabel(s: number) { return OrderStatusMap[s] || '未知' }
function statusType(s: number) { return OrderStatusTypeMap[s] || 'info' }

async function handleConfirm(orderId: number) {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '确认收货', { type: 'success' })
    await confirmReceiptApi(orderId)
    ElMessage.success('确认收货成功')
    await orderStore.fetchMyOrders()
    orders.value = orderStore.orders
  } catch {}
}

async function handleRefund(orderId: number) {
  try {
    await ElMessageBox.confirm('确定要退款/取消该订单吗？', '确认操作', { type: 'warning' })
    await requestRefundApi(orderId)
    ElMessage.success('操作成功')
    await orderStore.fetchMyOrders()
    orders.value = orderStore.orders
  } catch {}
}
</script>

<style scoped>
.orders-page { max-width: 1000px; margin: 0 auto; padding: 24px; }
h2 { font-size: 22px; margin-bottom: 20px; color: #303133; }
.order-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 16px; overflow: hidden; }
.order-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: #f5f7fa; }
.order-info { display: flex; gap: 20px; font-size: 13px; color: #606266; }
.order-items { padding: 0 20px; }
.order-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #ebeef5; }
.order-item:last-child { border-bottom: none; }
.item-info { display: flex; flex-direction: column; gap: 4px; }
.item-name { font-size: 14px; color: #303133; font-weight: 500; }
.item-price { font-size: 13px; color: #909399; }
.item-total { font-weight: 600; color: #303133; }
.order-footer { padding: 14px 20px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #ebeef5; flex-wrap: wrap; gap: 10px; }
.order-actions { display: flex; align-items: center; gap: 8px; }
.order-address { font-size: 13px; color: #909399; }
.order-total { font-size: 14px; color: #303133; flex-shrink: 0; }
.order-total strong { font-size: 18px; color: #f56c6c; font-family: 'Helvetica Neue', sans-serif; }
</style>
