<!--
  搜索栏组件

  提供关键词搜索 + 分类筛选功能。
  输入或切换分类时实时触发 search 事件通知父组件。
-->

<template>
  <div class="search-bar">
    <!-- 关键词搜索 -->
    <el-input
      v-model="keyword"
      placeholder="搜索书名、作者或ISBN..."
      clearable
      size="large"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <!-- 分类筛选下拉 -->
    <el-select v-model="categoryId" placeholder="全部分类" clearable size="large" @change="handleSearch">
      <el-option label="全部分类" :value="null" />
      <el-option
        v-for="cat in categories"
        :key="cat.id"
        :label="cat.name"
        :value="cat.id"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Category } from '@/types'

const props = defineProps<{
  /** 分类列表（从后端获取） */
  categories: Category[]
  /** 初始关键词（用于从其他页面带入搜索） */
  initialKeyword?: string
  /** 初始分类ID */
  initialCategoryId?: number | null
}>()

const emit = defineEmits<{
  /** 搜索条件变化时触发，传递当前关键词和分类ID */
  (e: 'search', data: { keyword: string; categoryId: number | null }): void
}>()

/** 搜索关键词 */
const keyword = ref(props.initialKeyword || '')
/** 选中分类ID（null = 全部分类） */
const categoryId = ref<number | null>(props.initialCategoryId || null)

/** 触发父组件的搜索逻辑 */
function handleSearch() {
  emit('search', {
    keyword: keyword.value,
    categoryId: categoryId.value,
  })
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  align-items: center;
}

.search-bar .el-input {
  flex: 1;
}

.search-bar .el-select {
  width: 180px;
}
</style>
