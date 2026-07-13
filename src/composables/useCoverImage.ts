/**
 * 多源封面图片加载
 *
 * 回退链：
 *   ① 数据库 cover_image → ② picsum 占位图 → ③ 本地 SVG（永不失败）
 */

import { ref } from 'vue'

const DEFAULT_COVER = '/images/default-cover.svg'

export function useCoverImage(coverImage?: string, isbn?: string) {

  const sources = buildSources(coverImage, isbn)
  const imgSrc = ref(sources[0])

  function onError() {
    const cur = sources.indexOf(imgSrc.value)
    const next = cur >= 0 ? cur + 1 : 0
    if (next < sources.length) {
      imgSrc.value = sources[next]
    }
  }

  return { imgSrc, onError }
}

function buildSources(coverImage?: string, isbn?: string): string[] {
  const urls: string[] = []

  // ① 数据库中的封面 URL（豆瓣真实封面或用户上传的）
  if (coverImage && coverImage.trim()) {
    urls.push(coverImage.trim())
  }

  // ② picsum 稳定占位图
  if (isbn) {
    const h = hash(isbn)
    urls.push(`https://picsum.photos/seed/book${h}/300x400`)
  } else {
    urls.push(`https://picsum.photos/seed/book0/300x400`)
  }

  // ③ 本地 SVG（绝对最终防线）
  urls.push(DEFAULT_COVER)

  return urls
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h) % 1000
}
