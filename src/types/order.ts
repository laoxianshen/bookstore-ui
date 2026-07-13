/**
 * 订单与购物车相关类型定义
 *
 * 对应后端实体：
 *   com.bookstore.entity.Order     — 订单主表 (order_tbl)
 *   com.bookstore.entity.OrderItem — 订单明细表 (order_item)
 *   com.bookstore.dto.CartItemDto  — 购物车展示DTO
 *
 * 订单状态码（后端 OrderStatus 常量类）：
 *   0 = PENDING_PAYMENT（待付款）
 *   1 = PAID（已付款）
 *   2 = SHIPPED（已发货）
 *   3 = COMPLETED（已完成）
 *   4 = CANCELLED（已取消）
 */

/** 订单状态中文标签映射 */
export const OrderStatusMap: Record<number, string> = {
  0: '待支付',
  1: '已支付',
  2: '已发货',
  3: '已完成',
  4: '已取消',
}

/** 订单状态对应的 Element Plus Tag 类型 */
export const OrderStatusTypeMap: Record<number, string> = {
  0: 'warning',
  1: 'success',
  2: 'primary',
  3: 'success',
  4: 'info',
}

/**
 * 订单明细
 * 下单时对图书信息做快照存储，后续图书信息变更不影响订单记录
 */
export interface OrderItem {
  /** 主键ID */
  id: number
  /** 所属订单ID */
  orderId: number
  /** 图书ID */
  bookId: number
  /** 图书名称快照（下单时的书名） */
  bookTitle: string
  /** 图书单价快照（下单时的价格） */
  bookPrice: number
  /** 购买数量 */
  quantity: number
  /** 小计金额 = 单价 × 数量 */
  totalPrice: number
}

/**
 * 订单实体
 * 对应后端 Order.java，表名为 order_tbl（因 order 是 MySQL 保留字）
 */
export interface Order {
  /** 主键ID */
  id: number
  /** 下单用户ID */
  userId: number
  /** 订单号，格式：ORD + yyyyMMddHHmmss + 3位序号，唯一 */
  orderNo: string
  /** 订单总金额（后端为 BigDecimal） */
  totalAmount: number
  /** 订单状态：0=待付款, 1=已付款, 2=已发货, 3=已完成, 4=已取消 */
  status: number
  /** 收货人姓名 */
  receiverName: string
  /** 收货人电话 */
  receiverPhone: string
  /** 收货地址 */
  receiverAddress: string
  /** 下单时间 */
  createTime: string
  /** 付款时间（可能为空） */
  payTime: string | null
  /** 用户名（非持久化字段，仅管理端展示用） */
  username?: string
  /** 订单明细列表 */
  orderItems?: OrderItem[]
}

/**
 * 购物车条目（后端 CartItemDto）
 * 后端服务层从 cart_item 表 JOIN book 表后组装返回
 */
export interface CartItemDto {
  /** 购物车条目ID */
  id: number
  /** 图书ID */
  bookId: number
  /** 图书名称 */
  bookTitle: string
  /** 图书单价（后端为 BigDecimal） */
  bookPrice: number
  /** 图书当前库存 */
  bookStock: number
  /** 购买数量 */
  quantity: number
  /** 小计金额 = 单价 × 数量 */
  subtotal: number
}
