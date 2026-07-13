/**
 * 分页逻辑组合式函数（Composable）
 *
 * 封装分页状态管理，提供页码/每页条数切换时的自动回调。
 *
 * 使用方式：
 *   const { page, pageSize, total, setPage, setPageSize, setTotal } = usePagination(fetchData)
 */

import { ref, computed } from 'vue'

/**
 * @param fetchFn        当页数或每页条数变化时触发的数据获取函数
 * @param defaultPageSize 默认每页条数
 */
export function usePagination(
  fetchFn: (page: number, pageSize: number) => Promise<void>,
  defaultPageSize = 10
) {
  /** 当前页码 */
  const page = ref(1)
  /** 每页条数 */
  const pageSize = ref(defaultPageSize)
  /** 总记录数（由外部调用 setTotal 设置） */
  const total = ref(0)

  /** 总页数（计算属性） */
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  /** 跳转到指定页并重新加载 */
  function setPage(p: number) {
    page.value = p
    fetchFn(page.value, pageSize.value)
  }

  /** 修改每页条数（重置到第1页）并重新加载 */
  function setPageSize(size: number) {
    pageSize.value = size
    page.value = 1
    fetchFn(page.value, pageSize.value)
  }

  /** 由外部设置总记录数 */
  function setTotal(t: number) {
    total.value = t
  }

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    setTotal,
  }
}
