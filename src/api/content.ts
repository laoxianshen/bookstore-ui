/**
 * 内容管理 API 模块（轮播图/公告/评价/优惠券）
 *
 * 对应后端：
 *   ContentRestController        — 公开接口 (/api/banners, /api/announcements, /api/books/{id}/reviews, /api/coupons/available)
 *   AdminContentRestController   — 管理接口 (/api/admin/content/**)
 */

import http from './index'
import type { ApiResponse, PageResult, Banner, Announcement, Review, Coupon, ReviewForm, Book } from '@/types'

// ==================== 公开接口 ====================

/** 获取启用的轮播图列表 */
export function fetchBannersApi() {
  return http.get<ApiResponse<Banner[]>>('/banners')
}

/** 获取已发布的公告列表 */
export function fetchAnnouncementsApi() {
  return http.get<ApiResponse<Announcement[]>>('/announcements')
}

/** 获取图书评价列表（分页） */
export function fetchBookReviewsApi(bookId: number, page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Review>>>(`/books/${bookId}/reviews`, { params: { page, size } })
}

/** 提交图书评价 */
export function submitReviewApi(bookId: number, data: ReviewForm) {
  return http.post<ApiResponse>(`/books/${bookId}/reviews`, data)
}

/** 获取可用优惠券列表 */
export function fetchAvailableCouponsApi() {
  return http.get<ApiResponse<Coupon[]>>('/coupons/available')
}

// ==================== 管理后台接口 ====================

/** 轮播图分页列表 */
export function fetchAdminBannersApi(page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Banner>>>('/admin/content/banners', { params: { page, size } })
}
export function createBannerApi(data: any) { return http.post<ApiResponse>('/admin/content/banners', data) }
export function updateBannerApi(id: number, data: any) { return http.put<ApiResponse>(`/admin/content/banners/${id}`, data) }
export function deleteBannerApi(id: number) { return http.delete<ApiResponse>(`/admin/content/banners/${id}`) }

/** 公告分页列表 */
export function fetchAdminAnnouncementsApi(page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Announcement>>>('/admin/content/announcements', { params: { page, size } })
}
export function createAnnouncementApi(data: any) { return http.post<ApiResponse>('/admin/content/announcements', data) }
export function updateAnnouncementApi(id: number, data: any) { return http.put<ApiResponse>(`/admin/content/announcements/${id}`, data) }
export function deleteAnnouncementApi(id: number) { return http.delete<ApiResponse>(`/admin/content/announcements/${id}`) }

/** 评价管理 */
export function fetchAdminReviewsApi(page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Review>>>('/admin/content/reviews', { params: { page, size } })
}
export function approveReviewApi(id: number) { return http.put<ApiResponse>(`/admin/content/reviews/${id}/approve`) }
export function rejectReviewApi(id: number) { return http.put<ApiResponse>(`/admin/content/reviews/${id}/reject`) }
export function deleteReviewApi(id: number) { return http.delete<ApiResponse>(`/admin/content/reviews/${id}`) }

/** 优惠券管理 */
export function fetchAdminCouponsApi(page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Coupon>>>('/admin/content/coupons', { params: { page, size } })
}
export function createCouponApi(data: any) { return http.post<ApiResponse>('/admin/content/coupons', data) }
export function updateCouponApi(id: number, data: any) { return http.put<ApiResponse>(`/admin/content/coupons/${id}`, data) }
export function deleteCouponApi(id: number) { return http.delete<ApiResponse>(`/admin/content/coupons/${id}`) }

// ==================== 收藏/心愿单 ====================
export function addFavoriteApi(bookId: number) { return http.post<ApiResponse>(`/favorites/${bookId}`) }
export function removeFavoriteApi(bookId: number) { return http.delete<ApiResponse>(`/favorites/${bookId}`) }
export function checkFavoriteApi(bookId: number) { return http.get<ApiResponse<boolean>>(`/favorites/check/${bookId}`) }
export function fetchFavoritesApi() { return http.get<ApiResponse<Book[]>>('/favorites') }

// ==================== 推荐 + 评价筛选 ====================
/** 智能推荐（收藏+购买+浏览+热度） */
export function fetchRecommendApi(limit: number = 6) { return http.get<ApiResponse<Book[]>>('/recommend', { params: { limit } }) }
/** 浏览历史追踪 */
export function trackViewApi(bookId: number) { return http.post<ApiResponse>('/history/view', { bookId }) }
export function fetchFilteredReviewsApi(bookId: number, minRating?: number, page: number = 1, size: number = 10) {
  return http.get<ApiResponse<PageResult<Review>>>(`/books/${bookId}/reviews/filter`, { params: { minRating, page, size } })
}

// ==================== 优惠券结算 ====================
export function calculateOrderApi(data: { totalAmount: number; couponId?: number }) {
  return http.post<ApiResponse<{ originalAmount: number; discount: number; finalAmount: number; couponName?: string }>>('/orders/calculate', data)
}

// ==================== 订单操作 ====================
export function confirmReceiptApi(orderId: number) { return http.put<ApiResponse>(`/orders/${orderId}/confirm`) }
export function requestRefundApi(orderId: number) { return http.put<ApiResponse>(`/orders/${orderId}/refund`) }
