/**
 * 图书 API 模块
 *
 * 对应后端：
 *   - 前台接口：com.bookstore.controller.api.BookRestController  (/api/books, /api/categories)
 *   - 后台接口：com.bookstore.controller.api.AdminRestController (/api/admin/books)
 */

import http from './index'
import type { ApiResponse, PageResult, Book, BookQueryParams, BookFormData, Category } from '@/types'

// ==================== 前台接口 ====================

/**
 * 分页搜索图书
 * GET /api/books
 * @param params.keyword   — 搜索关键词（匹配书名/作者）
 * @param params.categoryId — 分类ID筛选，null 为全部分类
 * @param params.page       — 页码，从1开始
 * @param params.size       — 每页条数
 */
export function fetchBooksApi(params: BookQueryParams) {
  return http.get<ApiResponse<PageResult<Book>>>('/books', { params })
}

/** ES 全文搜索图书 */
export function searchBooksApi(params: { keyword: string; categoryName?: string; page?: number; size?: number }) {
  return http.get<ApiResponse<PageResult<Book>>>('/search', { params })
}

/** 重建 ES 索引（管理员） */
export function reindexBooksApi() {
  return http.post<ApiResponse>('/admin/search/reindex')
}

/**
 * 获取图书详情
 * GET /api/books/{id}
 */
export function fetchBookByIdApi(id: number) {
  return http.get<ApiResponse<Book>>(`/books/${id}`)
}

/**
 * 获取最新上架图书
 * GET /api/books/latest
 */
export function fetchLatestBooksApi(limit: number = 8) {
  return http.get<ApiResponse<Book[]>>('/books/latest', { params: { limit } })
}

/**
 * 获取所有图书分类
 * GET /api/categories
 */
export function fetchCategoriesApi() {
  return http.get<ApiResponse<Category[]>>('/categories')
}

// ==================== 后台管理接口 ====================

/**
 * 新增图书（管理员）
 * POST /api/admin/books
 */
export function createBookApi(data: BookFormData) {
  return http.post<ApiResponse<Book>>('/admin/books', data)
}

/**
 * 更新图书（管理员）
 * PUT /api/admin/books/{id}
 */
export function updateBookApi(id: number, data: Partial<BookFormData>) {
  return http.put<ApiResponse>(`/admin/books/${id}`, data)
}

/**
 * 删除图书（管理员）
 * DELETE /api/admin/books/{id}
 */
export function deleteBookApi(id: number) {
  return http.delete<ApiResponse>(`/admin/books/${id}`)
}
