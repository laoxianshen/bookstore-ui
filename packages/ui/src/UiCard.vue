<!--
  UI 卡片组件 — 封装 el-card
  统一圆角、阴影、padding
-->
<template>
  <el-card
    :shadow="shadow"
    :body-style="{ padding: padding }"
    v-bind="$attrs"
    :class="['ui-card', { 'ui-card--hover': hover }]"
  >
    <template #header v-if="$slots.header || title">
      <slot name="header">
        <span class="ui-card__title">{{ title }}</span>
      </slot>
    </template>
    <slot />
  </el-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  shadow?: 'always' | 'hover' | 'never'
  padding?: string
  hover?: boolean
}>(), {
  shadow: 'hover',
  padding: '20px',
  hover: false,
})
</script>

<style scoped>
.ui-card {
  border-radius: 8px;
  overflow: hidden;
}
.ui-card--hover {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.ui-card--hover:hover {
  transform: translateY(-4px);
}
.ui-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
