/**
 * 用户相关类型定义
 *
 * 对应后端实体：com.bookstore.entity.User
 * 字段对照：
 *   后端 id(Long)        → 前端 id(number)
 *   后端 username(String) → 前端 username(string)
 *   后端 role(Integer)    → 前端 role(number)  — 0=普通用户，1=管理员
 *   后端 status(Integer)  → 前端 status(number) — 0=已禁用，1=正常
 *   后端 createTime(LocalDateTime) → 前端 createTime(string)
 */

/** 用户实体，对应后端 User.java */
export interface User {
  /** 主键ID，自增 */
  id: number
  /** 登录用户名，唯一 */
  username: string
  /** 密码（BCrypt加密），前端接收时通常为 null */
  password?: string
  /** 电子邮箱 */
  email: string
  /** 手机号码 */
  phone: string
  /** 角色：0=普通用户，1=管理员 */
  role: number
  /** 状态：0=已禁用，1=正常 */
  status: number
  /** 注册时间 */
  createTime: string
}

/** 登录表单 */
export interface LoginForm {
  /** 用户名，3-20个字符 */
  username: string
  /** 密码，6-20个字符 */
  password: string
}

/** 注册表单 */
export interface RegisterForm {
  /** 用户名，3-64个字符 */
  username: string
  /** 密码，6-128个字符 */
  password: string
  /** 确认密码，需与密码一致 */
  confirmPassword: string
  /** 电子邮箱 */
  email: string
  /** 手机号码 */
  phone: string
}

/** 更新个人资料表单 */
export interface UpdateProfileForm {
  /** 电子邮箱 */
  email: string
  /** 手机号码 */
  phone: string
}

/**
 * 收货地址
 * 对应后端 OrderConfirmDto 中的地址字段
 */
export interface Address {
  /** 收货人姓名 */
  receiverName: string
  /** 收货人电话 */
  receiverPhone: string
  /** 完整收货地址 */
  receiverAddress: string
}

/**
 * 判断用户是否为管理员
 * @param user 用户对象
 * @returns role === 1 时为 true
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 1
}

/**
 * 判断用户是否已登录且状态正常
 * @param user 用户对象
 * @returns 用户存在且 status === 1 时为 true
 */
export function isLoggedIn(user: User | null): boolean {
  return user !== null && user.status === 1
}

/**
 * 获取用户展示名称
 * @param user 用户对象
 * @returns 用户名
 */
export function userDisplayName(user: User): string {
  return user.username
}
