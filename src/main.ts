/**
 * 应用入口文件
 *
 * 初始化顺序：
 *   1. 创建 Vue 应用实例
 *   2. 注册所有 Element Plus 图标（全局可用，模板中直接用图标名）
 *   3. 安装 Pinia（状态管理）
 *   4. 安装 Vue Router（路由）
 *   5. 安装 Element Plus（UI 组件库）
 *   6. 挂载到 #app
 *
 * 后端通信：通过 Axios（src/api/index.ts）访问 localhost:8080/api
 * Mock 数据：已移除，全部使用真实后端接口
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 全局注册所有 Element Plus 图标，模板中可直接使用 <el-icon><IconName /></el-icon>
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())       // Pinia 状态管理
app.use(router)               // Vue Router 路由
app.use(ElementPlus, { size: 'default' })  // Element Plus UI

app.mount('#app')
