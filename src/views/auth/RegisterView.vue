<!--
  注册页面

  功能：用户名 + 邮箱 + 手机号 + 密码注册
  认证流程：调用 POST /api/auth/register → 后端创建用户 + Session → 自动登录
  密码需两次输入一致，注册成功自动跳转首页
-->

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <el-icon :size="40" color="#409eff"><Reading /></el-icon>
        <h2>注册账号</h2>
        <p>创建您的书城账户</p>
      </div>

      <!-- 注册表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" :prefix-icon="Phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 登录入口 -->
      <div class="auth-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, Phone, Reading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { usernameRules, passwordRules, emailRules, phoneRules } from '@/utils/validators'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

/** 注册表单数据 */
const form = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

/** 自定义验证：确认密码与密码一致 */
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: usernameRules,
  password: passwordRules,
  email: emailRules,
  phone: phoneRules,
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

/**
 * 处理注册
 * 验证通过后调用 authStore.register() → 注册成功自动登录 → 跳转首页
 */
async function handleRegister() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.register(form)
      ElMessage.success('注册成功')
      router.push('/')
    } catch {
      // Error handled by Axios interceptor
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  width: 460px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-header h2 {
  margin: 12px 0 4px;
  font-size: 22px;
  color: #303133;
}

.auth-header p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.submit-btn {
  width: 100%;
}

.auth-footer {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.auth-footer a {
  color: #409eff;
  text-decoration: none;
}
</style>
