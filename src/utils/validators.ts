/**
 * Element Plus 表单验证规则
 *
 * 集中管理常用的表单字段验证规则，避免在各组件中重复定义。
 * 使用方式：<el-form-item :rules="usernameRules" prop="username">
 */

import type { FormItemRule } from 'element-plus'

/** 用户名验证：必填 + 3-20字符 + 仅字母数字下划线 */
export const usernameRules: FormItemRule[] = [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
]

/** 密码验证：必填 + 6-20字符 */
export const passwordRules: FormItemRule[] = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 20, message: '密码长度为 6-20 个字符', trigger: 'blur' },
]

/** 邮箱验证：必填 + 邮箱格式 */
export const emailRules: FormItemRule[] = [
  { required: true, message: '请输入邮箱', trigger: 'blur' },
  { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
]

/** 手机号验证：必填 + 1开头的11位数字 */
export const phoneRules: FormItemRule[] = [
  { required: true, message: '请输入手机号', trigger: 'blur' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
]

/**
 * 生成必填验证规则
 * @param label 字段中文名（用于错误提示）
 */
export const requiredRule = (label: string): FormItemRule => ({
  required: true,
  message: `请输入${label}`,
  trigger: 'blur',
})
