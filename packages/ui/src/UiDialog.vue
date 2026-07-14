<!--
  UI 弹窗组件 — 封装 el-dialog
  统一宽度、关闭行为、按钮区布局
-->
<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :destroy-on-close="destroyOnClose"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <slot />
    <template #footer v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  width?: string
  closeOnClickModal?: boolean
  destroyOnClose?: boolean
}>(), {
  width: '600px',
  closeOnClickModal: false,
  destroyOnClose: true,
})

defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>
