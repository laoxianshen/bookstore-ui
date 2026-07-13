/**
 * 图书相关类型定义
 *
 * 对应后端实体：com.bookstore.entity.Book
 * 字段对照：
 *   后端 price(BigDecimal)         → 前端 price(number)
 *   后端 categoryId(Long)          → 前端 categoryId(number)
 *   后端 categoryName(String，非持久化) → 前端 categoryName(string)  — 由 SQL JOIN 填充
 *   后端 coverImage(String)        → 前端 coverImage(string)
 *   后端 createTime(LocalDateTime) → 前端 createTime(string)
 */

/** 图书实体，对应后端 Book.java */
export interface Book {
  /** 主键ID，自增 */
  id: number
  /** 书名 */
  title: string
  /** 作者 */
  author: string
  /** ISBN 国际标准书号 */
  isbn: string
  /** 单价（后端为 BigDecimal，前端为 number） */
  price: number
  /** 库存数量 */
  stock: number
  /** 所属分类ID，外键关联 category 表 */
  categoryId: number
  /** 分类名称（非数据库字段，由 MyBatis JOIN 查询填充） */
  categoryName: string
  /** 图书简介 */
  description: string
  /** 封面图片路径或 URL */
  coverImage: string
  /** 上架时间 */
  createTime: string
}

/** 新增/编辑图书表单数据 */
export interface BookFormData {
  /** 书名 */
  title: string
  /** 作者 */
  author: string
  /** ISBN */
  isbn: string
  /** 单价 */
  price: number
  /** 库存 */
  stock: number
  /** 分类ID */
  categoryId: number
  /** 简介 */
  description: string
  /** 封面图片 URL */
  coverImage: string
}

/**
 * 图书搜索/筛选参数
 * 对应后端 GET /api/books 的查询参数
 */
export interface BookQueryParams {
  /** 搜索关键词（匹配书名/作者） */
  keyword?: string
  /** 分类ID筛选，null 表示全部分类 */
  categoryId?: number | null
  /** 页码，从1开始 */
  page?: number
  /** 每页条数 */
  size?: number
}

/**
 * 图书分类
 * 对应后端 Category.java
 */
export interface Category {
  /** 分类ID */
  id: number
  /** 分类名称（唯一） */
  name: string
  /** 分类描述 */
  description: string
  /** 创建时间 */
  createTime: string
}
