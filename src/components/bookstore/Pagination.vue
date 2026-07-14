<!--
  分页组件封装
  对 Element Plus el-pagination 的二次封装，简化父子组件间的分页状态同步。
  使用 v-model 双向绑定 page 和 pageSize。
-->
<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="[8, 12, 20, 40]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}>()

const emit = defineEmits<{
  /** 页码变化 */
  (e: 'update:page', v: number): void
  /** 每页条数变化 */
  (e: 'update:pageSize', v: number): void
}>()

/** 内部当前页码（与外部 props.page 双向同步） */
const currentPage = ref(props.page)
/** 内部每页条数（与外部 props.pageSize 双向同步） */
const currentPageSize = ref(props.pageSize)

// 监听外部 props 变化以同步内部状态
watch(() => props.page, (v) => { currentPage.value = v })
watch(() => props.pageSize, (v) => { currentPageSize.value = v })

function handlePageChange(p: number) {
  emit('update:page', p)
}

function handleSizeChange(s: number) {
  emit('update:pageSize', s)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}
</style>
