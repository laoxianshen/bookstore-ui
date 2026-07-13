<!--
  管理后台 - 评价管理

  路由：/admin/reviews
  功能：审核用户评价（通过/拒绝/删除）
-->

<template>
  <div class="manage-page">
    <h3>评价管理</h3>
    <el-card style="margin-top:16px">
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="bookTitle" label="图书" width="150" show-overflow-tooltip />
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column label="评分" width="100">
          <template #default="{ row }"><el-rate :model-value="row.rating" disabled size="small" /></template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'" size="small">
              {{ row.status === 1 ? '已通过' : row.status === 2 ? '已拒绝' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status !== 1" type="success" link @click="approve(row.id)">通过</el-button>
            <el-button v-if="row.status !== 2" type="warning" link @click="reject(row.id)">拒绝</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAdminReviewsApi, approveReviewApi, rejectReviewApi, deleteReviewApi } from '@/api/content'
import type { Review } from '@/types'

const list = ref<Review[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

onMounted(load)

async function load() {
  const res = await fetchAdminReviewsApi(page.value, pageSize.value)
  list.value = res.data.data.list
  total.value = res.data.data.total
}

async function approve(id: number) { await approveReviewApi(id); ElMessage.success('已通过'); load() }
async function reject(id: number) { await rejectReviewApi(id); ElMessage.success('已拒绝'); load() }
async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  await deleteReviewApi(id)
  ElMessage.success('删除成功')
  load()
}
</script>

<style scoped>
.manage-page { padding: 20px; }
h3 { margin: 0; font-size: 18px; }
</style>
