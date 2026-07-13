/**
 * API 通用响应与页面数据类型定义
 *
 * 后端统一响应格式（com.bookstore.common.Result<T>）：
 *   { code: 200, message: "ok", data: {...} }
 */

/**
 * 后端统一 API 响应包装
 * @template T data 字段的具体类型
 */
export interface ApiResponse<T = any> {
  /** 状态码，200 表示成功 */
  code: number
  /** 响应消息 */
  message: string
  /** 响应数据 */
  data: T
}

/**
 * 分页查询结果
 * @template T 列表项类型
 */
export interface PageResult<T> {
  /** 当前页数据列表 */
  list: T[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 管理后台仪表盘数据
 * 对应后端 GET /api/admin/dashboard 返回
 */
export interface DashboardData {
  /** 图书总数 */
  totalBooks: number
  /** 有效订单总数（不含已取消） */
  totalOrders: number
  /** 注册用户总数 */
  totalUsers: number
  /** 总营收金额 */
  totalRevenue: number
  /** 今日新增订单数 */
  todayOrders: number
  /** 今日营收金额 */
  todayRevenue: number
  /** 近30天销售趋势 */
  salesTrend: { date: string; amount: number; count: number }[]
  /** 各分类图书分布（饼图数据） */
  categoryDistribution: { name: string; value: number }[]
  /** 最近10条订单 */
  recentOrders: {
    id: number
    username: string
    totalAmount: number
    status: string
    createdAt: string
  }[]
}
