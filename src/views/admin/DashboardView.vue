<!--
  管理后台 - 仪表盘页面

  路由：/admin
  功能：展示核心运营数据
    - 4张统计卡片（图书数/订单数/用户数/总营收）
    - 近30天销售趋势折线图（ECharts）
    - 图书分类分布饼图（ECharts）
    - 最近10条订单表格

  数据来源：GET /api/admin/dashboard
-->

<template>
  <div class="dashboard-page">
    <!-- 统计卡片行 -->
    <div class="stat-cards">
      <StatCard icon="Notebook" color="#409eff" title="图书总数" :value="dashboard.totalBooks" />
      <StatCard icon="ShoppingCartFull" color="#67c23a" title="订单总数" :value="dashboard.totalOrders" />
      <StatCard icon="UserFilled" color="#e6a23c" title="用户总数" :value="dashboard.totalUsers" />
      <StatCard icon="Money" color="#f56c6c" title="总营收" :value="'¥' + Number(dashboard.totalRevenue).toLocaleString()" />
    </div>

    <!-- 图表行 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <UiCard class="chart-card">
          <template #header><span>近30天销售趋势</span></template>
          <!-- ECharts 折线图：销售额 + 订单数双Y轴 -->
          <v-chart :option="salesTrendOption" style="height: 350px;" autoresize />
        </UiCard>
      </el-col>
      <el-col :span="8">
        <UiCard class="chart-card">
          <template #header><span>图书分类分布</span></template>
          <!-- ECharts 环形饼图：各分类占比 -->
          <v-chart :option="categoryOption" style="height: 350px;" autoresize />
        </UiCard>
      </el-col>
    </el-row>

    <!-- 最近订单表格 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <UiCard class="table-card">
          <template #header><span>最近订单</span></template>
          <UiTable :data="dashboard.recentOrders" size="small" max-height="400">
            <el-table-column prop="id" label="订单ID" width="80" />
            <el-table-column prop="username" label="用户" width="100" />
            <el-table-column label="金额" width="100">
              <template #default="{ row }">¥{{ Number(row.totalAmount).toFixed(2) }}</template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <UiTag size="small">{{ row.status }}</UiTag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" min-width="160" />
          </UiTable>
        </UiCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Notebook, ShoppingCartFull, UserFilled, Money } from '@element-plus/icons-vue'
import { fetchDashboardDataApi } from '@/api/dashboard'
import type { DashboardData } from '@/types'
import StatCard from '@/components/bookstore/StatCard.vue'

// ECharts 按需引入（减小打包体积）
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { UiTable, UiCard, UiTag } from '@bookstore/ui'

use([CanvasRenderer, LineChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

/** 仪表盘数据 */
const dashboard = ref<DashboardData>({
  totalBooks: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0,
  todayOrders: 0, todayRevenue: 0, salesTrend: [], categoryDistribution: [], recentOrders: [],
})

onMounted(async () => {
  try {
    const res = await fetchDashboardDataApi()
    dashboard.value = res.data.data
  } catch { /* error handled by interceptor */ }
})

/** 销售趋势图配置（双Y轴折线图） */
const salesTrendOption = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  legend: { data: ['销售额', '订单数'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category' as const, data: dashboard.value.salesTrend.map((s: any) => s.date), boundaryGap: false },
  yAxis: [
    { type: 'value' as const, name: '销售额 (¥)' },
    { type: 'value' as const, name: '订单数' },
  ],
  series: [
    { name: '销售额', type: 'line', data: dashboard.value.salesTrend.map((s: any) => s.amount), smooth: true, areaStyle: { opacity: 0.15 } },
    { name: '订单数', type: 'line', yAxisIndex: 1, data: dashboard.value.salesTrend.map((s: any) => s.count), smooth: true },
  ],
}))

/** 分类分布图配置（环形饼图） */
const categoryOption = computed(() => ({
  tooltip: { trigger: 'item' as const },
  legend: { bottom: '0%' },
  series: [{
    type: 'pie', radius: ['45%', '75%'], center: ['50%', '45%'],
    data: dashboard.value.categoryDistribution,
    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
    label: { formatter: '{b}\n{d}%' },
  }],
}))
</script>

<style scoped>
.dashboard-page { padding: 20px; }
.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.chart-card, .table-card { border-radius: 8px; height: 100%; }
</style>
