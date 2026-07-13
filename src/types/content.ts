/**
 * 内容管理相关类型定义
 *
 * 对应后端实体：
 *   Banner.java       — 首页轮播图
 *   Announcement.java — 系统公告
 *   Review.java       — 图书评价
 *   Coupon.java       — 优惠券
 */

/** 轮播图 */
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
  status: number       // 0=禁用，1=启用
  createTime: string
}

/** 系统公告 */
export interface Announcement {
  id: number
  title: string
  content: string
  status: number       // 0=草稿，1=已发布
  createTime: string
}

/** 图书评价 */
export interface Review {
  id: number
  bookId: number
  userId: number
  orderId?: number
  rating: number       // 1-5
  content: string
  status: number       // 0=待审核，1=已通过，2=已拒绝
  createTime: string
  username?: string    // 非持久化，由后端填充
  bookTitle?: string   // 非持久化，由后端填充
}

/** 优惠券 */
export interface Coupon {
  id: number
  name: string
  type: number         // 0=满减券，1=折扣券
  threshold: number    // 使用门槛金额
  discount: number     // 满减金额 或 折扣率
  totalCount: number
  usedCount: number
  startTime: string
  endTime: string
  status: number
  createTime: string
}

/** 评价提交表单 */
export interface ReviewForm {
  rating: number
  content: string
}

/** 公告表单 */
export interface AnnouncementForm {
  title: string
  content: string
  status: number
}

/** 轮播图表单 */
export interface BannerForm {
  title: string
  imageUrl: string
  linkUrl: string
  sortOrder: number
  status: number
}

/** 优惠券表单 */
export interface CouponForm {
  name: string
  type: number
  threshold: number
  discount: number
  totalCount: number
  startTime: string
  endTime: string
  status: number
}

/** 优惠券类型映射 */
export const CouponTypeMap: Record<number, string> = {
  0: '满减券',
  1: '折扣券',
}
