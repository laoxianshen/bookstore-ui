<!--
  UI 表格组件 — 封装 el-table
  统一 stripe、empty-text、max-height 等默认行为
-->
<template>
  <el-table
    :data="data"
    :stripe="stripe"
    :border="border"
    :max-height="maxHeight"
    :v-loading="loading"
    :highlight-current-row="highlightCurrentRow"
    :empty-text="emptyText"
    v-bind="$attrs"
  >
    <slot />
  </el-table>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  data: any[]
  stripe?: boolean
  border?: boolean
  maxHeight?: string | number
  loading?: boolean
  highlightCurrentRow?: boolean
  emptyText?: string
}>(), {
  stripe: true,
  border: false,
  emptyText: '暂无数据',
})
</script>
