<!--
  管理后台 - 图书管理页面

  路由：/admin/books
  功能：图书 CRUD 表格
    - 列表展示（ID、封面、书名、作者、分类、售价、库存）
    - 新增图书（弹窗表单）
    - 编辑图书（弹窗表单回填）
    - 删除图书（确认弹窗）
    - 分页

  数据来源：bookStore → GET /api/books, POST/PUT/DELETE /api/admin/books
-->

<template>
  <div class="book-manage-page">
    <!-- 工具栏 -->
    <div class="page-toolbar">
      <h3>图书管理</h3>
      <UiButton type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon> 新增图书
      </UiButton>
    </div>

    <!-- 图书表格 -->
    <UiCard>
      <UiTable :data="bookStore.books" v-loading="bookStore.loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="封面" width="80">
          <template #default="{ row }">
            <el-image :src="row.coverImage || '/images/default-cover.svg'" style="width: 40px; height: 56px" fit="cover"><template #error><img src="/images/default-cover.svg" style="width:40px;height:56px;object-fit:cover" /></template></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="书名" min-width="160" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="100" />
        <el-table-column prop="categoryName" label="分类" width="100">
          <template #default="{ row }">
            <UiTag size="small">{{ row.categoryName }}</UiTag>
          </template>
        </el-table-column>
        <el-table-column label="售价" width="80">
          <template #default="{ row }">¥{{ Number(row.price).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="70" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <UiButton type="primary" link @click="openEditDialog(row)">编辑</UiButton>
            <UiButton type="danger" link @click="handleDelete(row.id)">删除</UiButton>
          </template>
        </el-table-column>
      </UiTable>

      <!-- 分页 -->
      <div style="text-align: center; padding: 20px 0;" v-if="bookStore.total > 0">
        <UiPagination
          v-model:current-page="bookStore.filter.page"
          v-model:page-size="bookStore.filter.size"
          :total="bookStore.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="loadBooks"
          @size-change="loadBooks"
        />
      </div>
    </UiCard>

    <!-- 新增/编辑弹窗 -->
    <BookForm v-model="showFormDialog" :book="editingBook" :categories="bookStore.categories" @submit="handleFormSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useBookStore } from '@/stores/book'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Book } from '@/types'
import BookForm from '@/components/bookstore/BookForm.vue'
import { UiButton, UiTable, UiCard, UiTag, UiPagination } from '@bookstore/ui'

const bookStore = useBookStore()

/** 是否显示新增/编辑弹窗 */
const showFormDialog = ref(false)
/** 正在编辑的图书（null = 新增模式） */
const editingBook = ref<Book | null>(null)

onMounted(async () => {
  bookStore.filter.size = 10
  await bookStore.fetchCategories()
  await bookStore.fetchBooks()
})

function loadBooks() { bookStore.fetchBooks() }

/** 打开新增图书弹窗 */
function openCreateDialog() {
  editingBook.value = null
  showFormDialog.value = true
}

/** 打开编辑图书弹窗（回填数据） */
function openEditDialog(book: Book) {
  editingBook.value = book
  showFormDialog.value = true
}

/** 表单提交处理（新增/编辑统一入口） */
async function handleFormSubmit(data: any) {
  try {
    if (editingBook.value) {
      await bookStore.updateBook(editingBook.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await bookStore.createBook(data)
      ElMessage.success('添加成功')
    }
    showFormDialog.value = false
  } catch { /* error handled by interceptor */ }
}

/** 删除图书（需确认） */
async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该图书吗？', '确认删除', { type: 'warning' })
    await bookStore.deleteBook(id)
    ElMessage.success('删除成功')
  } catch { /* user cancelled */ }
}
</script>

<style scoped>
.book-manage-page { padding: 20px; }
.page-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-toolbar h3 { margin: 0; font-size: 18px; color: #303133; }
</style>
