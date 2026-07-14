<!--
  管理后台 - 优惠券管理

  路由：/admin/coupons
  功能：创建/编辑/删除优惠券（满减券 或 折扣券）
-->

<template>
  <div class="manage-page">
    <div class="page-toolbar">
      <h3>优惠券管理</h3>
      <UiButton type="primary" @click="openDialog(null)"><el-icon><Plus /></el-icon> 新增优惠券</UiButton>
    </div>

    <UiCard>
      <UiTable :data="list" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">{{ row.type === 0 ? '满减券' : '折扣券' }}</template>
        </el-table-column>
        <el-table-column label="门槛/优惠" width="150">
          <template #default="{ row }">
            <template v-if="row.type === 0">满¥{{ row.threshold }}减¥{{ row.discount }}</template>
            <template v-else>{{ (row.discount * 100).toFixed(0) }}折</template>
          </template>
        </el-table-column>
        <el-table-column label="已领/总量" width="90">
          <template #default="{ row }">{{ row.usedCount }}/{{ row.totalCount }}</template>
        </el-table-column>
        <el-table-column label="有效期" width="200">
          <template #default="{ row }">{{ row.startTime }} ~ {{ row.endTime }}</template>
        </el-table-column>
        <el-table-column label="状态" width="70">
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

    <UiDialog v-model="showDialog" :title="editing ? '编辑优惠券' : '新增优惠券'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="form.type"><el-radio :value="0">满减券</el-radio><el-radio :value="1">折扣券</el-radio></el-radio-group>
        </el-form-item>
        <el-form-item :label="form.type === 0 ? '满减门槛(¥)' : '无门槛'" prop="threshold" v-if="form.type === 0">
          <el-input-number v-model="form.threshold" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item :label="form.type === 0 ? '减免金额(¥)' : '折扣率'" prop="discount">
          <el-input-number v-model="form.discount" :min="0.01" :max="form.type === 0 ? 9999 : 0.99" :precision="2" />
          <span v-if="form.type === 1" style="margin-left:8px;color:#909399">如 0.85 = 85折</span>
        </el-form-item>
        <el-form-item label="发放总量" prop="totalCount">
          <el-input-number v-model="form.totalCount" :min="1" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="状态">
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
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchAdminCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi } from '@/api/content'
import type { Coupon } from '@/types'
import { UiButton, UiTable, UiDialog, UiCard, UiTag } from '@bookstore/ui'

const list = ref<Coupon[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const showDialog = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const statusOn = ref(true)

const form = reactive({ name: '', type: 0, threshold: 0, discount: 0, totalCount: 100, startTime: '', endTime: '' })

const rules: FormRules = {
  name: [{ required: true, message: '请输入名称' }],
  discount: [{ required: true, message: '请输入优惠' }],
  startTime: [{ required: true, message: '选择开始时间' }],
  endTime: [{ required: true, message: '选择结束时间' }],
}

onMounted(load)

async function load() {
  const res = await fetchAdminCouponsApi(page.value, pageSize.value)
  list.value = res.data.data.list
  total.value = res.data.data.total
}

function openDialog(c: Coupon | null) {
  editing.value = !!c
  editingId.value = c?.id ?? null
  statusOn.value = c ? c.status === 1 : true
  Object.assign(form, c || { name: '', type: 0, threshold: 0, discount: 0, totalCount: 100, startTime: '', endTime: '' })
  showDialog.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const data = { ...form, status: statusOn.value ? 1 : 0 }
    if (editing.value && editingId.value) await updateCouponApi(editingId.value, data)
    else await createCouponApi(data)
    ElMessage.success(editing.value ? '更新成功' : '添加成功')
    showDialog.value = false
    load()
  })
}

async function handleDelete(id: number) {
  await ElMessageBox.confirm('确定删除？', '确认', { type: 'warning' })
  await deleteCouponApi(id)
  ElMessage.success('删除成功')
  load()
}
</script>

<style scoped>
.manage-page { padding: 20px; }
.page-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.page-toolbar h3 { margin: 0; font-size: 18px; }
</style>
