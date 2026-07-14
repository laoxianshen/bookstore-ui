<!--
  UI 按钮组件 — 封装 el-button
  统一项目中的按钮尺寸、圆角、loading 交互
-->
<template>
  <el-button
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :plain="plain"
    :link="link"
    :circle="circle"
    :round="round"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </el-button>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
  size?: 'large' | 'default' | 'small'
  disabled?: boolean
  loading?: boolean
  icon?: any
  plain?: boolean
  link?: boolean
  circle?: boolean
  round?: boolean
}>()

defineEmits<{ (e: 'click', event: MouseEvent): void }>()
</script>
