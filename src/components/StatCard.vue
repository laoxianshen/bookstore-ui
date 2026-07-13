<!--
  统计卡片组件

  用于仪表盘展示关键指标：总数、营收等。
  支持显示趋势百分比（可选）。
-->

<template>
  <el-card class="stat-card" shadow="hover">
    <div class="stat-content">
      <!-- 图标区域 -->
      <div class="stat-icon" :style="{ background: color }">
        <el-icon :size="28"><component :is="icon" /></el-icon>
      </div>
      <!-- 数值区域 -->
      <div class="stat-body">
        <div class="stat-value">{{ value }}</div>
        <div class="stat-title">{{ title }}</div>
        <!-- 趋势指示（可选） -->
        <div class="stat-trend" v-if="trend !== undefined">
          <span :class="trend > 0 ? 'up' : 'down'">
            <el-icon><component :is="'TrendCharts'" /></el-icon>
            {{ Math.abs(trend) }}%
          </span>
          <span class="trend-label">{{ trendLabel }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps<{
  /** Element Plus 图标名称（需全局注册） */
  icon: string
  /** 图标背景色 */
  color: string
  /** 指标标题 */
  title: string
  /** 指标数值 */
  value: string | number
  /** 趋势百分比（正数=上升，负数=下降） */
  trend?: number
  /** 趋势说明文字 */
  trendLabel?: string
}>()
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #fff;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  font-family: 'Helvetica Neue', sans-serif;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-top: 2px;
}

.stat-trend {
  margin-top: 4px;
  font-size: 12px;
}

.stat-trend .up {
  color: #67c23a;
}

.stat-trend .down {
  color: #f56c6c;
}

.trend-label {
  color: #c0c4cc;
  margin-left: 4px;
}
</style>
