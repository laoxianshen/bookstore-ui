<!--
  管理后台 - 用户管理页面

  路由：/admin/users
  功能：
    - 查看全部用户列表（用户名、邮箱、手机号、角色、状态、注册时间）
    - 启用/禁用用户（toggle status 0↔1）
    - 分页

  注意：admin 用户（id=1）的操作按钮被禁用，防止误操作
  数据来源：GET /api/admin/users, PUT /api/admin/users/{id}/status
-->

<template>
  <div class="user-manage-page">
    <h3>用户管理</h3>

    <UiCard>
      <UiTable :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />

        <!-- 角色标签：管理员=红色，普通用户=灰色 -->
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <UiTag :type="row.role === 1 ? 'danger' : 'info'" size="small">
              {{ row.role === 1 ? '管理员' : '普通用户' }}
            </UiTag>
          </template>
        </el-table-column>

        <!-- 状态标签：正常=绿色，禁用=红色 -->
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <UiTag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </UiTag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" width="160" />

        <!-- 操作：启用/禁用（admin 账号不可操作） -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <UiButton
              type="primary"
              link
              @click="handleToggleStatus(row)"
              :disabled="row.id === 1"  <!-- 保护默认管理员 -->
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </UiButton>
          </template>
        </el-table-column>
      </UiTable>

      <!-- 分页 -->
      <div style="text-align: center; padding: 20px 0;" v-if="total > 0">
        <UiPagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="loadUsers"
          @size-change="loadUsers"
        />
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchUsersApi, updateUserStatusApi } from '@/api/dashboard'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UiButton, UiTable, UiCard, UiTag, UiPagination } from '@bookstore/ui'

const users = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

onMounted(() => loadUsers())

/** 分页加载用户列表 */
async function loadUsers() {
  loading.value = true
  try {
    const res = await fetchUsersApi({ page: page.value, size: pageSize.value })
    users.value = res.data.data.list
    total.value = res.data.data.total
  } finally {
    loading.value = false
  }
}

/**
 * 切换用户启用/禁用状态
 * 弹出确认框 → 调用 PUT /api/admin/users/{id}/status → 刷新列表
 */
async function handleToggleStatus(row: any) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户"${row.username}"吗？`, '确认操作')
    await updateUserStatusApi(row.id, newStatus)
    ElMessage.success(`用户已${action}`)
    loadUsers()
  } catch { /* user cancelled */ }
}
</script>

<style scoped>
.user-manage-page { padding: 20px; }
h3 { margin: 0 0 16px; font-size: 18px; color: #303133; }
</style>
