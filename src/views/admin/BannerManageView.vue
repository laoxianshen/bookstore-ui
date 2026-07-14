<!--
  管理后台 - 轮播图管理

  路由：/admin/banners
  功能：管理首页轮播图的增删改查和排序
-->

<template>
  <div class="manage-page">
    <div class="page-toolbar">
      <h3>轮播图管理</h3>
      <UiButton type="primary" @click="openDialog(null)"><el-icon><Plus /></el-icon> 新增轮播图</UiButton>
    </div>

    <UiCard>
      <UiTable :data="list" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image :src="row.imageUrl" style="width:180px;height:60px" fit="cover"><template #error><img src="/images/default-cover.svg" style="width:180px;height:60px;object-fit:cover" /></template></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="sortOrder" label="排序" width="70" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <UiTag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</UiTag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <UiButton type="primary" link @click="openDialog(row)">编辑</UiButton>
            <UiButton type="danger" link @click="handleDelete(row.id)">删除</UiButton>
          </template>
        </el-table-column>
      </UiTable>
      <pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </UiCard>

    <UiDialog v-model="showDialog" :title="editing ? '编辑轮播图' : '新增轮播图'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="图片URL" prop="imageUrl"><el-input v-model="form.imageUrl" placeholder="https://..." /></el-form-item>
        <el-form-item label="跳转链接" prop="linkUrl"><el-input v-model="form.linkUrl" placeholder="可选" /></el-form-item>
        <el-form-item label="排序" prop="sortOrder"><el-input-number v-model="form.sortOrder" :min="0" /></el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="statusOn" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <UiButton @click="showDialog = false">取消</UiButton>
        <UiButton type="primary" @click="handleSubmit">保存</UiButton>
      </template>
    </UiDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchAdminBannersApi, createBannerApi, updateBannerApi, deleteBannerApi } from '@/api/content'
import type { Banner } from '@/types'
import { UiButton, UiTable, UiDialog, UiCard, UiTag } from '@bookstore/ui'

const list = ref<Banner[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const showDialog = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const statusOn = ref(true)

const form = reactive({ title: '', imageUrl: '', linkUrl: '', sortOrder: 0 })

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题' }],
  imageUrl: [{ required: true, message: '请输入图片URL' }],
}

onMounted(load)

async function load() {
  const res = await fetchAdminBannersApi(page.value, pageSize.value)
  list.value = res.data.data.list
  total.value = res.data.data.total
}

function openDialog(banner: Banner | null) {
  editing.value = !!banner
  editingId.value = banner?.id ?? null
  statusOn.value = banner ? banner.status === 1 : true
  Object.assign(form, banner || { title: '', imageUrl: '', linkUrl: '', sortOrder: 0 })
  showDialog.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const data = { ...form, status: statusOn.value ? 1 : 0 }
    if (editing.value && editingId.value) {
      await updateBannerApi(editingId.value, data)
    } else {
      await createBannerApi(data)
    }
    ElMessage.success(editing.value ? '更新成功' : '添加成功')
    showDialog.value = false
    load()
  })
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  await deleteBannerApi(id)
  ElMessage.success('删除成功')
  load()
}
</script>

<style scoped>
.manage-page { padding: 20px; }
.page-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-toolbar h3 { margin: 0; font-size: 18px; }
</style>
