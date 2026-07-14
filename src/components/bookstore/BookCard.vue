<!--
  图书卡片组件

  展示图书封面、书名、作者、分类标签、价格、库存信息。
  点击卡片跳转到图书详情页，点击"加入购物车"按钮直接添加。
  未登录时提示登录，库存为0时按钮禁用。
-->

<template>
  <!-- 点击卡片进入图书详情 -->
  <UiCard class="book-card" shadow="hover" @click="$router.push(`/books/${book.id}`)">
    <!-- 封面图 -->
    <div class="book-cover">
      <img :src="imgSrc" :alt="book.title" @error="onError" />
    </div>

    <div class="book-info">
      <!-- 书名（单行截断） -->
      <h3 class="book-title">{{ book.title }}</h3>
      <!-- 作者 -->
      <p class="book-author">{{ book.author }}</p>

      <!-- 分类标签 -->
      <div class="book-meta">
        <span class="book-category">
          <UiTag size="small" type="info">{{ book.categoryName }}</UiTag>
        </span>
      </div>

      <!-- 价格 -->
      <div class="book-bottom">
        <div class="book-price">
          <span class="price-now">¥{{ Number(book.price).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 库存状态 -->
      <div class="book-stock" v-if="book.stock > 0">库存 {{ book.stock }} 件</div>
      <div class="book-stock out-of-stock" v-else>暂时缺货</div>

      <!-- 加入购物车按钮（.stop 阻止冒泡到卡片点击） -->
      <UiButton
        type="primary"
        class="add-cart-btn"
        :disabled="book.stock === 0"
        @click.stop="handleAddToCart"
      >
        <el-icon><ShoppingCartFull /></el-icon>
        加入购物车
      </UiButton>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import type { Book } from '@/types'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCartFull } from '@element-plus/icons-vue'
import { useCoverImage } from '@/composables/useCoverImage'
import { UiButton, UiCard, UiTag } from '@bookstore/ui'

const props = defineProps<{
  /** 图书实体 */
  book: Book
}>()

// 多源封面加载
const { imgSrc, onError } = useCoverImage(props.book.coverImage, props.book.isbn)

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

/** 加入购物车：未登录则跳登录页，否则调用接口并提示成功 */
async function handleAddToCart() {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再添加到购物车')
    router.push('/login')
    return
  }
  await cartStore.addToCart(props.book.id, 1)
  ElMessage.success(`《${props.book.title}》已加入购物车`)
}
</script>

<style scoped>
.book-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

/* 悬停上浮效果 */
.book-card:hover {
  transform: translateY(-4px);
}

.book-cover {
  width: 100%;
  padding-top: 133%;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  background: linear-gradient(135deg, #e8eaed 0%, #f0f1f3 50%, #e8eaed 100%);
}

.book-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 12px;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
}

.book-author {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px;
}

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.book-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-now {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  font-family: 'Helvetica Neue', sans-serif;
}

.book-stock {
  font-size: 12px;
  color: #67c23a;
  margin-bottom: 8px;
}

.book-stock.out-of-stock {
  color: #f56c6c;
}

.add-cart-btn {
  width: 100%;
  margin-top: auto;           /* 始终贴底 */
}
</style>
