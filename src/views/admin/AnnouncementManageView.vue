<!--
  管理后台 - 公告管理

  路由：/admin/announcements
  功能：发布/编辑/删除系统公告
-->

<template>
  <div class="manage-page">
    <div class="page-toolbar">
      <h3>公告管理</h3>
      <el-button type="primary" @click="openDialog(null)"><el-icon><Plus /></el-icon> 发布公告</el-button>
    </div>

    <el-card>
      <el-table :data="list" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </el-card>

    <el-dialog v-model="showDialog" :title="editing ? '编辑公告' : '发布公告'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容" prop="content"><el-input v-model="form.content" type="textarea" :rows="6" /></el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="statusOn" active-text="已发布" inactive-text="草稿" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchAdminAnnouncementsApi, createAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi } from '@/api/content'
import type { Announcement } from '@/types'

const list = ref<Announcement[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const showDialog = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const statusOn = ref(true)

const form = reactive({ title: '', content: '' })

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题' }],
  content: [{ required: true, message: '请输入内容' }],
}

onMounted(load)

async function load() {
  const res = await fetchAdminAnnouncementsApi(page.value, pageSize.value)
  list.value = res.data.data.list
  total.value = res.data.data.total
}

function openDialog(a: Announcement | null) {
  editing.value = !!a
  editingId.value = a?.id ?? null
  statusOn.value = a ? a.status === 1 : true
  Object.assign(form, a || { title: '', content: '' })
  showDialog.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const data = { ...form, status: statusOn.value ? 1 : 0 }
    if (editing.value && editingId.value) await updateAnnouncementApi(editingId.value, data)
    else await createAnnouncementApi(data)
    ElMessage.success(editing.value ? '更新成功' : '发布成功')
    showDialog.value = false
    load()
  })
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  await deleteAnnouncementApi(id)
  ElMessage.success('删除成功')
  load()
}
</script>

<style scoped>
.manage-page { padding: 20px; }
.page-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-toolbar h3 { margin: 0; font-size: 18px; }
</style>
