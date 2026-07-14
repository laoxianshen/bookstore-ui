<!--
  购物车页面（增强版）

  新增功能：
  - 全选/取消全选 + 批量删除
  - 优惠券选择 + 实时金额计算
  - 数量修改 + 单个删除
-->

<template>
  <div class="cart-page">
    <h2>我的购物车</h2>

    <div v-if="cartStore.items.length > 0">
      <!-- 工具栏：全选 + 批量删除 -->
      <div class="cart-toolbar">
        <el-checkbox v-model="selectAll" @change="handleSelectAll" :indeterminate="isIndeterminate">
          全选（{{ selectedIds.size }}/{{ cartStore.items.length }}）
        </el-checkbox>
        <UiButton type="danger" size="small" :disabled="selectedIds.size === 0" @click="handleBatchRemove">
          批量删除
        </UiButton>
      </div>

      <div class="cart-list">
        <div class="cart-header">
          <span class="col-check"></span>
          <span class="col-book">图书信息</span>
          <span class="col-price">单价</span>
          <span class="col-quantity">数量</span>
          <span class="col-subtotal">小计</span>
          <span class="col-action">操作</span>
        </div>

        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="col-check">
            <el-checkbox :model-value="selectedIds.has(item.id)" @change="(v: boolean) => toggleSelect(item.id, v)" />
          </div>
          <div class="col-book"><span class="item-title">{{ item.bookTitle }}</span></div>
          <div class="col-price">¥{{ Number(item.bookPrice).toFixed(2) }}</div>
          <div class="col-quantity">
            <el-input-number :model-value="item.quantity" :min="1" :max="item.bookStock" size="small"
              @change="(val: number) => cartStore.updateQuantity(item.id, val)" />
          </div>
          <div class="col-subtotal">¥{{ Number(item.subtotal).toFixed(2) }}</div>
          <div class="col-action">
            <UiButton type="danger" link @click="handleRemove(item.id)">删除</UiButton>
          </div>
        </div>
      </div>

      <!-- 优惠券选择 -->
      <div class="coupon-bar">
        <span class="coupon-label">优惠券：</span>
        <el-select v-model="selectedCouponId" placeholder="选择优惠券" clearable size="default" @change="handleCouponChange">
          <el-option v-for="c in coupons" :key="c.id" :label="couponLabel(c)" :value="c.id" />
        </el-select>
        <span v-if="discount > 0" class="discount-text">已优惠 ¥{{ discount.toFixed(2) }}</span>
      </div>

      <!-- 底部结算栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <UiButton @click="handleClear">清空购物车</UiButton>
        </div>
        <div class="footer-right">
          <span class="total-text">
            共 <strong>{{ selectedIds.size || cartStore.totalCount }}</strong> 件，合计：
            <span class="total-price">¥{{ (cartStore.totalPrice - discount).toFixed(2) }}</span>
            <span v-if="discount > 0" class="original-price">（原价 ¥{{ cartStore.totalPrice.toFixed(2) }}）</span>
          </span>
          <UiButton type="primary" size="large" @click="showAddressDialog = true">去结算</UiButton>
        </div>
      </div>
    </div>

    <UiEmpty v-else description="购物车是空的">
      <UiButton type="primary" @click="$router.push('/')">去逛逛</UiButton>
    </UiEmpty>

    <!-- 收货地址弹窗 -->
    <UiDialog v-model="showAddressDialog" title="填写收货地址" width="500px">
      <el-form ref="addressRef" :model="address" :rules="addressRules" label-width="100px">
        <el-form-item label="收货人" prop="receiverName"><el-input v-model="address.receiverName" /></el-form-item>
        <el-form-item label="手机号" prop="receiverPhone"><el-input v-model="address.receiverPhone" /></el-form-item>
        <el-form-item label="收货地址" prop="receiverAddress"><el-input v-model="address.receiverAddress" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <UiButton @click="showAddressDialog = false">取消</UiButton>
        <UiButton type="primary" @click="handleSubmitOrder" :loading="submitting">确认下单</UiButton>
      </template>
    </UiDialog>

    <!-- 猜你喜欢 -->
    <div v-if="recommendBooks.length > 0" class="recommend-section">
      <h3>猜你喜欢</h3>
      <div class="book-grid">
        <BookCard v-for="b in recommendBooks" :key="'r'+b.id" :book="b" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrderStore } from '@/stores/order'
import { fetchAvailableCouponsApi, calculateOrderApi, fetchRecommendApi } from '@/api/content'
import type { FormInstance, FormRules } from 'element-plus'
import type { Coupon, Book } from '@/types'
import { ElMessage } from 'element-plus'
import BookCard from '@/components/bookstore/BookCard.vue'
import { UiButton, UiDialog, UiEmpty } from '@bookstore/ui'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const showAddressDialog = ref(false)
const submitting = ref(false)
const addressRef = ref<FormInstance>()

// ---- 商品选择 ----
const selectedIds = ref<Set<number>>(new Set())
const selectAll = ref(false)
const isIndeterminate = ref(false)

function toggleSelect(id: number, checked: boolean) {
  if (checked) selectedIds.value.add(id); else selectedIds.value.delete(id)
  updateSelectState()
}
function handleSelectAll(val: boolean) {
  if (val) cartStore.items.forEach(i => selectedIds.value.add(i.id))
  else selectedIds.value.clear()
  updateSelectState()
}
function updateSelectState() {
  selectAll.value = selectedIds.value.size === cartStore.items.length && cartStore.items.length > 0
  isIndeterminate.value = selectedIds.value.size > 0 && selectedIds.value.size < cartStore.items.length
}

// ---- 优惠券 ----
const coupons = ref<Coupon[]>([])
const selectedCouponId = ref<number | null>(null)
const discount = ref(0)

const recommendBooks = ref<Book[]>([])

onMounted(async () => {
  await cartStore.fetchCart()
  try { const res = await fetchAvailableCouponsApi(); coupons.value = res.data.data } catch {}
  try { const r = await fetchRecommendApi(4); recommendBooks.value = r.data.data } catch {}
})

function couponLabel(c: Coupon) {
  return c.type === 0 ? `${c.name}（满¥${c.threshold}减¥${c.discount}）` : `${c.name}（${(c.discount * 100).toFixed(0)}折）`
}

async function handleCouponChange() {
  if (!selectedCouponId.value) { discount.value = 0; return }
  try {
    const res = await calculateOrderApi({ totalAmount: cartStore.totalPrice, couponId: selectedCouponId.value })
    discount.value = res.data.data.discount
  } catch { discount.value = 0 }
}

// ---- 操作 ----
async function handleRemove(id: number) {
  await cartStore.removeFromCart(id)
  selectedIds.value.delete(id)
  updateSelectState()
  ElMessage.success('已移除')
}
async function handleBatchRemove() {
  for (const id of selectedIds.value) await cartStore.removeFromCart(id)
  selectedIds.value.clear()
  updateSelectState()
  ElMessage.success('已批量删除')
}
async function handleClear() {
  await cartStore.clearCart()
  selectedIds.value.clear()
  updateSelectState()
}

// ---- 下单 ----
const address = reactive({ receiverName: '', receiverPhone: '', receiverAddress: '' })
const addressRules: FormRules = {
  receiverName: [{ required: true, message: '请输入收货人' }],
  receiverPhone: [{ required: true, message: '请输入手机号' }],
  receiverAddress: [{ required: true, message: '请输入收货地址' }],
}

async function handleSubmitOrder() {
  if (!addressRef.value) return
  await addressRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await orderStore.createOrder({ ...address })
      ElMessage.success('下单成功！')
      showAddressDialog.value = false
      router.push('/orders')
    } catch {} finally { submitting.value = false }
  })
}
</script>

<style scoped>
.cart-page { max-width: 1100px; margin: 0 auto; padding: 24px; }
h2 { font-size: 22px; margin-bottom: 20px; }
.cart-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: #fff; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.cart-list { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.cart-header { display: flex; align-items: center; padding: 14px 20px; background: #f5f7fa; font-size: 13px; color: #909399; font-weight: 600; }
.cart-item { display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #ebeef5; }
.col-check { flex: 0.3; }
.col-book { flex: 3; }
.col-price { flex: 1; text-align: center; color: #303133; }
.col-quantity { flex: 1; text-align: center; }
.col-subtotal { flex: 1; text-align: center; color: #f56c6c; font-weight: 600; }
.col-action { flex: 0.6; text-align: center; }
.item-title { font-size: 14px; color: #303133; font-weight: 500; padding-left: 4px; }
.coupon-bar { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; margin-top: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.coupon-label { font-size: 14px; color: #606266; }
.discount-text { color: #f56c6c; font-weight: 600; }
.cart-footer { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: #fff; margin-top: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.total-text { font-size: 16px; margin-right: 20px; }
.total-price { font-size: 22px; font-weight: bold; color: #f56c6c; font-family: 'Helvetica Neue', sans-serif; }
.original-price { font-size: 13px; color: #c0c4cc; text-decoration: line-through; margin-left: 8px; }
.footer-right { display: flex; align-items: center; }
.recommend-section { margin-top: 40px; }
.recommend-section h3 { font-size: 18px; color: #303133; margin-bottom: 16px; }
.recommend-section .book-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
</style>
