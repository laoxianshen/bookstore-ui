<!--
  图书详情页

  路由：/books/:id
  功能：展示图书完整信息（封面、作者、ISBN、分类、价格、库存、简介）
        支持选择数量加入购物车或立即购买
-->

<template>
  <div class="book-detail-page" v-loading="loading">
    <div v-if="book" class="detail-content">
      <!-- 左侧：封面图 -->
      <div class="detail-left">
        <el-image :src="book.coverImage || '/images/default-cover.svg'" fit="cover" class="cover-image"><template #error><img src="/images/default-cover.svg" style="width:100%;height:100%;object-fit:cover" /></template></el-image>
      </div>

      <!-- 右侧：图书信息 -->
      <div class="detail-right">
        <h1 class="book-title">{{ book.title }}</h1>

        <!-- 元信息 -->
        <div class="book-meta">
          <span class="meta-item">作者：{{ book.author }}</span>
          <span class="meta-item">ISBN：{{ book.isbn }}</span>
          <span class="meta-item">上架时间：{{ book.createTime }}</span>
        </div>
        <UiTag>{{ book.categoryName }}</UiTag>

        <!-- 价格 -->
        <div class="price-row">
          <span class="price-now">¥{{ Number(book.price).toFixed(2) }}</span>
        </div>

        <!-- 库存状态 -->
        <div class="stock-row">
          <span v-if="book.stock > 0" class="in-stock">
            <el-icon><CircleCheck /></el-icon> 有货 (库存 {{ book.stock }} 件)
          </span>
          <span v-else class="out-stock">
            <el-icon><CircleClose /></el-icon> 暂时缺货
          </span>
        </div>

        <!-- 操作按钮 -->
        <div class="action-row">
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="book.stock"
            :disabled="book.stock === 0"
            size="large"
          />
          <UiButton type="primary" size="large" :disabled="book.stock === 0" @click="handleAddToCart">
            <el-icon><ShoppingCartFull /></el-icon> 加入购物车
          </UiButton>
          <UiButton type="success" size="large" :disabled="book.stock === 0" @click="handleBuyNow">
            <el-icon><Lightning /></el-icon> 立即购买
          </UiButton>
          <UiButton :type="isFavorited ? 'warning' : 'info'" size="large" @click="toggleFavorite">
            <el-icon><Star /></el-icon> {{ isFavorited ? '已收藏' : '收藏' }}
          </UiButton>
        </div>

        <!-- 图书简介 -->
        <div class="description" v-if="book.description">
          <h3>图书简介</h3>
          <p>{{ book.description }}</p>
        </div>
      </div>
    </div>

    <UiEmpty v-else-if="!loading" description="图书不存在" />

    <!-- 评价区域 -->
    <div v-if="book" class="reviews-section">
      <div class="reviews-header">
        <h3>图书评价 ({{ reviewTotal }})</h3>
        <UiButton v-if="authStore.isLoggedIn" type="primary" size="small" @click="showReviewForm = true">写评价</UiButton>
      </div>

      <!-- 发表评价 -->
      <div v-if="showReviewForm" class="review-form">
        <el-rate v-model="reviewForm.rating" show-text />
        <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="分享你的阅读体验..." style="margin:8px 0" />
        <UiButton type="primary" size="small" @click="handleSubmitReview" :loading="submittingReview">提交评价</UiButton>
        <UiButton size="small" @click="showReviewForm = false">取消</UiButton>
      </div>

      <!-- 评价筛选 -->
      <div class="review-filter">
        <el-radio-group v-model="reviewFilter" size="small" @change="loadReviews(book!.id)">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="4">好评(4-5分)</el-radio-button>
          <el-radio-button value="1">差评(1-3分)</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 评价列表 -->
      <div v-if="reviews.length > 0" class="review-list">
        <div v-for="r in reviews" :key="r.id" class="review-item">
          <div class="review-meta">
            <span class="review-user">{{ r.username || '匿名用户' }}</span>
            <el-rate :model-value="r.rating" disabled size="small" />
            <span class="review-time">{{ r.createTime }}</span>
          </div>
          <p class="review-content">{{ r.content }}</p>
        </div>
      </div>
      <UiEmpty v-else description="暂无评价" :image-size="60" />
    </div>

    <!-- 猜你喜欢 -->
    <div v-if="recommendations.length > 0" class="recommendations-section">
      <h3>猜你喜欢</h3>
      <div class="book-grid">
        <BookCard v-for="b in recommendations" :key="b.id" :book="b" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCartFull, Lightning, CircleCheck, CircleClose, Star } from '@element-plus/icons-vue'
import { useBookStore } from '@/stores/book'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { fetchBookReviewsApi, fetchFilteredReviewsApi, submitReviewApi, checkFavoriteApi, addFavoriteApi, removeFavoriteApi, fetchRecommendApi, trackViewApi } from '@/api/content'
import { ElMessage } from 'element-plus'
import type { Book, Review } from '@/types'
import { UiButton, UiTag, UiEmpty } from '@bookstore/ui'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const book = ref<Book | null>(null)
const quantity = ref(1)
const loading = ref(false)

// Reviews
const reviews = ref<Review[]>([])
const reviewTotal = ref(0)
const reviewFilter = ref('')
const showReviewForm = ref(false)
const submittingReview = ref(false)
const reviewForm = reactive({ rating: 5, content: '' })

// Favorites
const isFavorited = ref(false)

// Recommendations
const recommendations = ref<Book[]>([])

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) return
  loading.value = true
  try {
    book.value = await bookStore.fetchBookById(id)
    await Promise.all([loadReviews(id), loadFavStatus(id), loadRecommendations(), trackViewApi(id)])
  } finally {
    loading.value = false
  }
})

async function loadReviews(bookId: number) {
  try {
    const minRating = reviewFilter.value ? Number(reviewFilter.value) : undefined
    const fn = minRating ? fetchFilteredReviewsApi : fetchBookReviewsApi
    const res = await fn(bookId, minRating as any)
    reviews.value = res.data.data.list
    reviewTotal.value = res.data.data.total
  } catch {}
}

async function loadFavStatus(bookId: number) {
  try { const res = await checkFavoriteApi(bookId); isFavorited.value = res.data.data } catch {}
}

async function loadRecommendations() {
  try { const res = await fetchRecommendApi(4); recommendations.value = res.data.data } catch {}
}

async function toggleFavorite() {
  if (!authStore.isLoggedIn) { ElMessage.warning('请先登录'); router.push('/login'); return }
  try {
    if (isFavorited.value) {
      await removeFavoriteApi(book.value!.id)
      isFavorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavoriteApi(book.value!.id)
      isFavorited.value = true
      ElMessage.success('已加入收藏')
    }
  } catch {}
}

async function handleSubmitReview() {
  if (!reviewForm.content.trim()) { ElMessage.warning('请输入评价内容'); return }
  submittingReview.value = true
  try {
    await submitReviewApi(book.value!.id, { ...reviewForm })
    ElMessage.success('评价提交成功')
    showReviewForm.value = false
    reviewForm.content = ''
    reviewForm.rating = 5
    await loadReviews(book.value!.id)
  } catch {} finally { submittingReview.value = false }
}

/** 加入购物车 */
async function handleAddToCart() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  if (!book.value) return
  await cartStore.addToCart(book.value.id, quantity.value)
  ElMessage.success(`《${book.value.title}》已加入购物车`)
}

/** 立即购买：加入购物车并跳转到购物车页面 */
function handleBuyNow() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  handleAddToCart()
  router.push('/cart')
}
</script>

<style scoped>
.book-detail-page {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.detail-content {
  display: flex;
  gap: 40px;
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.detail-left {
  width: 300px;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.cover-image :deep(img) {
  width: 100%;
}

.detail-right {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: 24px;
  margin: 0 0 16px;
  color: #303133;
}

.book-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: block;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.price-row {
  padding: 16px;
  background: #fef0f0;
  border-radius: 6px;
  margin: 16px 0;
}

.price-now {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
  font-family: 'Helvetica Neue', sans-serif;
}

.stock-row {
  margin: 16px 0;
}

.in-stock { color: #67c23a; font-size: 14px; }
.out-stock { color: #f56c6c; font-size: 14px; }

.action-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 20px 0;
}

.description {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.description h3 { font-size: 16px; margin-bottom: 12px; color: #303133; }
.description p { font-size: 14px; color: #606266; line-height: 1.8; }

.reviews-section { max-width: 1100px; margin: 24px auto; background: #fff; padding: 24px 32px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
.reviews-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.reviews-header h3 { font-size: 18px; color: #303133; }
.review-form { padding: 16px; background: #f5f7fa; border-radius: 8px; margin-bottom: 16px; }
.review-item { padding: 14px 0; border-bottom: 1px solid #ebeef5; }
.review-item:last-child { border-bottom: none; }
.review-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.review-user { font-weight: 600; color: #303133; }
.review-time { font-size: 12px; color: #c0c4cc; margin-left: auto; }
.review-content { font-size: 14px; color: #606266; line-height: 1.6; }
.review-filter { margin: 12px 0; }

.recommendations-section { max-width: 1100px; margin: 24px auto; padding: 24px 0; }
.recommendations-section h3 { font-size: 18px; color: #303133; margin-bottom: 16px; }
.recommendations-section .book-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
</style>
