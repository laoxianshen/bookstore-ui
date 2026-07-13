/**
 * Axios 实例配置与拦截器
 *
 * 核心配置：
 * - baseURL：指向后端 Spring Boot 服务（8080 端口）
 * - withCredentials：启用跨域携带 Session Cookie
 * - 响应拦截：自动检测业务错误码并弹出提示
 *
 * 对应后端：com.bookstore.common.Result<T> 统一响应格式
 */

import axios from 'axios'
import type { ApiResponse } from '@/types'
import { ElMessage } from 'element-plus'

const http = axios.create({
  /** 后端 REST API 基础地址 */
  baseURL: 'http://localhost:8080/api',
  /** 请求超时时间（毫秒） */
  timeout: 10000,
  /** 允许跨域请求携带 Session Cookie（后端基于 HttpSession 认证） */
  withCredentials: true,
})

/**
 * 响应拦截器
 * - 成功响应但业务 code !== 200：弹出错误提示并 reject
 * - 网络错误或其他异常：弹出错误提示并 reject
 */
http.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResponse
    // 业务层错误（如登录失败、权限不足等）
    if (data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  (error) => {
    // 网络层错误或后端异常
    const msg = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default http
