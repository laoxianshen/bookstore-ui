<!--
  我的收藏/心愿单页面

  路由：/favorites（需登录）
  功能：查看已收藏的图书，点击进入详情或取消收藏
-->

<template>
  <div class="favorites-page">
    <h2>我的收藏</h2>
    <div v-if="books.length > 0" class="book-grid">
      <BookCard v-for="book in books" :key="book.id" :book="book" />
    </div>
    <UiEmpty v-else description="还没有收藏任何图书">
      <UiButton type="primary" @click="$router.push('/')">去逛逛</UiButton>
    </UiEmpty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchFavoritesApi } from '@/api/content'
import type { Book } from '@/types'
import BookCard from '@/components/bookstore/BookCard.vue'
import { UiButton, UiEmpty } from '@bookstore/ui'

const books = ref<Book[]>([])

onMounted(async () => {
  try { const res = await fetchFavoritesApi(); books.value = res.data.data } catch {}
})
</script>

<style scoped>
.favorites-page { max-width: 1100px; margin: 0 auto; padding: 24px; }
h2 { font-size: 22px; margin-bottom: 20px; }
.book-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
</style>
