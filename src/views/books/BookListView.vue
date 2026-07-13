<!--
  首页 - 图书列表页

  功能：
  - 展示图书卡片网格（4列）
  - 关键词搜索 + 分类筛选
  - 底部分页

  数据流：
  bookStore.fetchBooks() → GET /api/books → 渲染 BookCard 列表
-->

<template>
  <div class="book-list-page">
    <!-- 页面横幅 -->
    <div class="page-banner">
      <h1>网上书城</h1>
      <p>发现好书，享受阅读的乐趣</p>
    </div>

    <!-- 轮播图 -->
    <el-carousel v-if="banners.length > 0" :interval="4000" type="card" height="280px" class="banner-carousel">
      <el-carousel-item v-for="b in banners" :key="b.id">
        <a :href="b.linkUrl || '#'" @click.prevent="$router.push(b.linkUrl || '/')">
          <img :src="b.imageUrl" :alt="b.title" style="width:100%;height:100%;object-fit:cover;border-radius:8px" @error="(e: Event) => { const t = e.target as HTMLImageElement; if (!t.src.endsWith('/images/default-cover.svg')) t.src = '/images/default-cover.svg' }" />
        </a>
      </el-carousel-item>
    </el-carousel>

    <!-- 公告栏 -->
    <div v-if="announcements.length > 0" class="announcement-bar">
      <el-icon><Bell /></el-icon>
      <el-scrollbar class="announcement-scroll">
        <span v-for="a in announcements" :key="a.id" class="announcement-item">
          【{{ a.title }}】{{ a.content.slice(0, 60) }}{{ a.content.length > 60 ? '...' : '' }}
          &nbsp;&nbsp;&nbsp;
        </span>
      </el-scrollbar>
    </div>

    <!-- 搜索栏 -->
    <SearchBar
      :categories="bookStore.categories"
      :initial-category-id="bookStore.filter.categoryId"
      @search="handleSearch"
    />

    <!-- 图书网格 -->
    <div v-loading="bookStore.loading" class="book-grid-container">
      <el-empty v-if="!bookStore.loading && bookStore.books.length === 0" description="未找到相关图书" />
      <div v-else class="book-grid">
        <BookCard v-for="book in bookStore.books" :key="book.id" :book="book" />
      </div>
    </div>

    <!-- 猜你喜欢 -->
    <div v-if="recommendBooks.length > 0" class="recommend-section">
      <h3 class="section-title">猜你喜欢</h3>
      <div class="book-grid">
        <BookCard v-for="book in recommendBooks" :key="'r'+book.id" :book="book" />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="bookStore.total > 0" style="text-align: center; padding: 20px 0;">
      <el-pagination
        v-model:current-page="bookStore.filter.page"
        v-model:page-size="bookStore.filter.size"
        :total="bookStore.total"
        :page-sizes="[8, 12, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useBookStore } from '@/stores/book'
import { fetchBannersApi, fetchAnnouncementsApi, fetchRecommendApi } from '@/api/content'
import type { Banner, Announcement, Book } from '@/types'
import BookCard from '@/components/BookCard.vue'
import SearchBar from '@/components/SearchBar.vue'

const bookStore = useBookStore()
const banners = ref<Banner[]>([])
const announcements = ref<Announcement[]>([])
const recommendBooks = ref<Book[]>([])

onMounted(async () => {
  await Promise.all([
    bookStore.fetchCategories(),
    bookStore.fetchBooks(),
    loadBanners(),
    loadAnnouncements(),
    loadRecommends(),
  ])
})

async function loadBanners() {
  try { const res = await fetchBannersApi(); banners.value = res.data.data } catch {}
}
async function loadAnnouncements() {
  try { const res = await fetchAnnouncementsApi(); announcements.value = res.data.data } catch {}
}
async function loadRecommends() {
  try { const res = await fetchRecommendApi(4); recommendBooks.value = res.data.data } catch {}
}

function handleSearch(data: { keyword: string; categoryId: number | null }) {
  bookStore.setFilter(data)
  // 有搜索关键词时使用 ES 全文搜索，否则走 MySQL 常规查询
  if (data.keyword) {
    const catName = bookStore.categories.find(c => c.id === data.categoryId)?.name
    bookStore.searchBooks(data.keyword, catName)
  } else {
    bookStore.fetchBooks()
  }
}

function handlePageChange(page: number) {
  bookStore.filter.page = page
  doSearch()
}

function handleSizeChange(size: number) {
  bookStore.filter.size = size
  bookStore.filter.page = 1
  doSearch()
}

/** 根据当前筛选条件选择 ES 搜索或常规查询 */
function doSearch() {
  if (bookStore.filter.keyword) {
    const catName = bookStore.categories.find(c => c.id === bookStore.filter.categoryId)?.name
    bookStore.searchBooks(bookStore.filter.keyword, catName)
  } else {
    bookStore.fetchBooks()
  }
}
</script>

<style scoped>
.page-banner {
  text-align: center;
  padding: 40px 0 30px;
}

.page-banner h1 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 8px;
  font-weight: 700;
}

.page-banner p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.banner-carousel {
  max-width: 1100px;
  margin: 0 auto 20px;
}

.announcement-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1100px;
  margin: 0 auto 16px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  color: #e6a23c;
  font-size: 14px;
  white-space: nowrap;
}

.announcement-scroll {
  flex: 1;
  overflow: hidden;
}

.announcement-item {
  color: #606266;
  display: inline;
}

.recommend-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.book-grid-container {
  min-height: 300px;
}
</style>
