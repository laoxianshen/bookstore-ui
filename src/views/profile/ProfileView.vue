<!--
  个人中心页面

  功能：查看和编辑当前用户的个人信息（邮箱、手机号）。
  用户名和角色为只读，注册时间仅展示。
-->

<template>
  <div class="profile-page">
    <h2>个人中心</h2>

    <UiCard class="profile-card">
      <el-form :model="form" :rules="rules" label-width="100px" class="profile-form">
        <!-- 用户名（只读） -->
        <el-form-item label="用户名">
          <el-input :model-value="authStore.user?.username" disabled />
        </el-form-item>

        <!-- 可编辑字段 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <!-- 角色（只读） -->
        <el-form-item label="角色">
          <UiTag :type="authStore.isAdmin ? 'danger' : 'info'">
            {{ authStore.isAdmin ? '管理员' : '普通用户' }}
          </UiTag>
        </el-form-item>

        <!-- 注册时间（只读） -->
        <el-form-item label="注册时间">
          <span>{{ authStore.user?.createTime }}</span>
        </el-form-item>

        <!-- 保存按钮 -->
        <el-form-item>
          <UiButton type="primary" @click="handleSave" :loading="saving">保存修改</UiButton>
        </el-form-item>
      </el-form>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { emailRules, phoneRules } from '@/utils/validators'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { UiButton, UiCard, UiTag } from '@bookstore/ui'

const authStore = useAuthStore()
const saving = ref(false)
const formRef = ref<FormInstance>()

/** 表单数据 */
const form = reactive({
  email: '',
  phone: '',
})

const rules: FormRules = {
  email: emailRules,
  phone: phoneRules,
}

/** 页面加载时回填当前用户数据 */
onMounted(() => {
  if (authStore.user) {
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
  }
})

/**
 * 保存个人信息
 * 调用 PUT /api/auth/profile，更新成功后刷新 state
 */
async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await authStore.updateProfile(form)
      ElMessage.success('个人信息更新成功')
    } catch {
      // Error handled by interceptor
    } finally {
      saving.value = false
    }
  })
}
</script>

<style scoped>
.profile-page { max-width: 700px; margin: 0 auto; padding: 24px; }
h2 { font-size: 22px; margin-bottom: 20px; color: #303133; }
.profile-card { border-radius: 8px; }
.profile-form { max-width: 500px; padding: 20px 0; }
</style>
