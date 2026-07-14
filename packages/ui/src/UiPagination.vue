<!--
  UI 分页组件 — 封装 el-pagination
  统一 layout、page-sizes、background
-->
<template>
  <div class="ui-pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  total: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
}>(), {
  page: 1,
  pageSize: 12,
  pageSizes: () => [8, 12, 20, 40],
})

const emit = defineEmits<{
  (e: 'update:page', v: number): void
  (e: 'update:pageSize', v: number): void
}>()

const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

watch(() => props.page, v => { currentPage.value = v })
watch(() => props.pageSize, v => { currentPageSize.value = v })

function handlePageChange(p: number) { emit('update:page', p) }
function handleSizeChange(s: number) { emit('update:pageSize', s) }
</script>

<style scoped>
.ui-pagination {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}
</style>
