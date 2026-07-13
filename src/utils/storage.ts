/**
 * localStorage 工具函数
 *
 * 提供类型安全的本地存储读写操作，统一添加 'bookstore_' 前缀避免键名冲突。
 * 所有读写操作均包含 try-catch 保护（如 localStorage 满或隐私模式下可能抛异常）。
 */

/** 所有存储键的统一前缀 */
const PREFIX = 'bookstore_'

/**
 * 从 localStorage 读取值
 * @param key          存储键名（不含前缀）
 * @param defaultValue 读取失败或不存在时的默认值
 * @returns 解析后的值或默认值
 */
export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

/**
 * 写入值到 localStorage
 * @param key   存储键名（不含前缀）
 * @param value 要存储的值（自动 JSON 序列化）
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    console.warn(`Failed to save ${key} to localStorage`)
  }
}

/**
 * 从 localStorage 删除指定键
 * @param key 存储键名（不含前缀）
 */
export function removeStorage(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
