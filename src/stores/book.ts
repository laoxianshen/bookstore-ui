/**
 * 图书数据状态管理（Pinia Store）
 *
 * 管理图书列表的搜索、筛选、分页状态，
 * 以及图书详情的缓存和管理后台的 CRUD 操作。
 *
 * 对应后端 API：/api/books, /api/categories, /api/admin/books
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { Book, BookQueryParams, BookFormData, Category } from '@/types'
import {
  fetchBooksApi,
  searchBooksApi,
  fetchBookByIdApi,
  fetchCategoriesApi,
  createBookApi,
  updateBookApi,
  deleteBookApi,
} from '@/api/book'

export const useBookStore = defineStore('book', () => {
  /** 当前图书列表 */
  const books = ref<Book[]>([])
  /** 当前查看的图书详情 */
  const currentBook = ref<Book | null>(null)
  /** 所有分类列表 */
  const categories = ref<Category[]>([])
  /** 当前筛选条件下的总记录数 */
  const total = ref(0)
  /** 是否正在加载 */
  const loading = ref(false)

  /**
   * 当前筛选/分页参数
   * 使用 reactive 以便模板中双向绑定自动触发响应
   */
  const filter = reactive<BookQueryParams>({
    keyword: '',
    categoryId: undefined,
    page: 1,
    size: 12,
  })

  /**
   * 分页获取图书列表（MySQL 常规查询）
   */
  async function fetchBooks(params?: BookQueryParams) {
    loading.value = true
    try {
      const queryParams = params || filter
      const res = await fetchBooksApi(queryParams)
      books.value = res.data.data.list
      total.value = res.data.data.total
    } finally {
      loading.value = false
    }
  }

  /**
   * ES 全文搜索图书
   * 当有搜索关键词时使用，支持书名/作者/简介的模糊匹配
   */
  async function searchBooks(keyword: string, categoryName?: string) {
    loading.value = true
    try {
      const res = await searchBooksApi({
        keyword,
        categoryName,
        page: filter.page,
        size: filter.size,
      })
      books.value = res.data.data.list || []
      total.value = res.data.data.total || 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取单本图书详情
   * 结果同时缓存到 currentBook
   */
  async function fetchBookById(id: number) {
    const res = await fetchBookByIdApi(id)
    currentBook.value = res.data.data
    return currentBook.value
  }

  /** 获取所有分类列表 */
  async function fetchCategories() {
    const res = await fetchCategoriesApi()
    categories.value = res.data.data
  }

  /** 新增图书（管理员），成功后刷新列表 */
  async function createBook(data: BookFormData) {
    await createBookApi(data)
    await fetchBooks()
  }

  /** 更新图书（管理员），成功后刷新列表 */
  async function updateBook(id: number, data: Partial<BookFormData>) {
    await updateBookApi(id, data)
    await fetchBooks()
  }

  /** 删除图书（管理员），成功后刷新列表 */
  async function deleteBook(id: number) {
    await deleteBookApi(id)
    await fetchBooks()
  }

  /**
   * 更新筛选条件并重置到第1页
   * 用于搜索栏输入/分类切换时触发
   */
  function setFilter(newFilter: Partial<BookQueryParams>) {
    Object.assign(filter, newFilter)
    filter.page = 1
  }

  return {
    books,
    currentBook,
    categories,
    total,
    loading,
    filter,
    fetchBooks,
    searchBooks,
    fetchBookById,
    fetchCategories,
    createBook,
    updateBook,
    deleteBook,
    setFilter,
  }
})
