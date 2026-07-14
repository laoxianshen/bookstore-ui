<!--
  UI 标签组件 — 封装 el-tag
  提供语义化 type 映射：info/success/warning/danger
-->
<template>
  <el-tag
    :type="type === 'default' ? '' : (type as any)"
    :size="size"
    :effect="effect"
    :round="round"
    v-bind="$attrs"
  >
    <slot />
  </el-tag>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: string
  size?: 'large' | 'default' | 'small'
  effect?: 'dark' | 'light' | 'plain'
  round?: boolean
}>(), {
  type: 'info',
  size: 'small',
  effect: 'light',
})
</script>
