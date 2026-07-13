<!--
  登录页面

  功能：用户名 + 密码登录
  认证流程：调用 POST /api/auth/login → 后端创建 Session → 前端存储用户信息
  已登录用户访问此页面会自动重定向到首页（路由守卫控制）
-->

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <el-icon :size="40" color="#409eff"><Reading /></el-icon>
        <h2>登录网上书城</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册入口 -->
      <div class="auth-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>

      <!-- 演示账号提示 -->
      <div class="demo-tips">
        <p>演示账号：admin / admin123（管理员）</p>
        <p>或自行注册新账号</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Reading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { usernameRules, passwordRules } from '@/utils/validators'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

/** 登录表单数据 */
const form = reactive({
  username: '',
  password: '',
})

/** 表单验证规则（复用公共规则） */
const rules = {
  username: usernameRules,
  password: passwordRules,
}

/**
 * 处理登录
 * 先验证表单 → 调用 authStore.login() → 成功后跳转首页
 * 失败时错误已由 Axios 拦截器统一处理
 */
async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await authStore.login(form)
      ElMessage.success('登录成功')
      router.push('/')
    } catch {
      // Error already handled by Axios interceptor
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
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
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

.demo-tips {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  text-align: center;
}

.demo-tips p {
  margin: 2px 0;
  font-size: 12px;
  color: #909399;
}
</style>
