<!--
  管理后台 - 订单管理页面

  路由：/admin/orders
  功能：
    - 查看全部订单列表（含用户名、金额、状态、收货信息）
    - 通过下拉框修改订单状态（0=待支付→1=已支付→2=已发货→3=已完成→4=已取消）
    - 分页

  数据来源：GET /api/admin/orders, PUT /api/admin/orders/{id}/status
-->

<template>
  <div class="order-manage-page">
    <h3>订单管理</h3>

    <el-card>
      <el-table :data="orderStore.allOrders" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column label="金额" width="100">
          <template #default="{ row }">¥{{ Number(row.totalAmount).toFixed(2) }}</template>
        </el-table-column>
        <!-- 状态标签 -->
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="OrderStatusTypeMap[row.status] || 'info'">{{ OrderStatusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <!-- 收货信息 -->
        <el-table-column label="收货信息" min-width="180">
          <template #default="{ row }">
            {{ row.receiverName }} {{ row.receiverPhone }}<br />
            {{ row.receiverAddress }}
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="160" prop="createTime" />
        <!-- 状态修改下拉框 -->
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-select
              :model-value="row.status"
              size="small"
              @change="(val: number) => handleStatusChange(row.id, val)"
            >
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.value === row.status"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div style="text-align: center; padding: 20px 0;" v-if="orderStore.total > 0">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="orderStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="loadOrders"
          @size-change="loadOrders"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { OrderStatusMap, OrderStatusTypeMap } from '@/types'
import { ElMessage } from 'element-plus'

const orderStore = useOrderStore()
const page = ref(1)
const pageSize = ref(10)

/** 订单状态选项（对应后端 OrderStatus 常量） */
const statusOptions = [
  { label: '待支付', value: 0 },
  { label: '已支付', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
]

onMounted(() => loadOrders())

function loadOrders() {
  orderStore.fetchAllOrdersAdmin(page.value, pageSize.value)
}

/**
 * 修改订单状态
 * 调用 PUT /api/admin/orders/{id}/status，成功后刷新列表
 */
async function handleStatusChange(orderId: number, status: number) {
  try {
    await orderStore.updateOrderStatus(orderId, status)
    ElMessage.success('订单状态已更新')
    loadOrders()
  } catch { /* error handled by interceptor */ }
}
</script>

<style scoped>
.order-manage-page { padding: 20px; }
h3 { margin: 0 0 16px; font-size: 18px; color: #303133; }
</style>
