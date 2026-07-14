<!--
  图书表单弹窗组件

  用于管理后台的"新增图书"和"编辑图书"操作。
  通过 modelValue 控制显隐，book 为 null 时为新增模式，否则为编辑模式。
-->

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑图书' : '新增图书'"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <!-- 书名 -->
      <el-form-item label="书名" prop="title">
        <el-input v-model="form.title" placeholder="请输入书名" />
      </el-form-item>
      <!-- 作者 -->
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <!-- ISBN -->
      <el-form-item label="ISBN" prop="isbn">
        <el-input v-model="form.isbn" placeholder="请输入ISBN" />
      </el-form-item>
      <!-- 售价 -->
      <el-form-item label="售价" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
      </el-form-item>
      <!-- 分类 -->
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
          <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
        </el-select>
      </el-form-item>
      <!-- 库存 -->
      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
      </el-form-item>
      <!-- 封面URL -->
      <el-form-item label="封面URL" prop="coverImage">
        <el-input v-model="form.coverImage" placeholder="请输入封面图片URL" />
      </el-form-item>
      <!-- 简介 -->
      <el-form-item label="简介" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入图书简介" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '保存' : '添加' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Book, Category } from '@/types'

const props = defineProps<{
  /** 控制弹窗显隐 */
  modelValue: boolean
  /** 编辑时传入已有图书，新增时为 null */
  book?: Book | null
  /** 分类列表（用于下拉选项） */
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  /** 表单提交时触发，参数为 BookFormData */
  (e: 'submit', data: any): void
}>()

/** 是否为编辑模式 */
const isEdit = ref(false)
const formRef = ref<FormInstance>()

/** 表单默认值（新增模式） */
const defaultForm = {
  title: '',
  author: '',
  isbn: '',
  price: 0,
  stock: 0,
  categoryId: null as number | null,
  description: '',
  coverImage: '',
}

const form = reactive({ ...defaultForm })

/** 验证规则 */
const rules: FormRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
}

/** 监听弹窗打开，初始化表单数据 */
watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.book) {
      // 编辑模式：回填已有数据
      isEdit.value = true
      Object.assign(form, {
        title: props.book.title,
        author: props.book.author,
        isbn: props.book.isbn,
        price: props.book.price,
        stock: props.book.stock,
        categoryId: props.book.categoryId,
        description: props.book.description,
        coverImage: props.book.coverImage,
      })
    } else {
      // 新增模式：重置为空表单
      isEdit.value = false
      Object.assign(form, defaultForm)
    }
  }
})

/** 关闭弹窗并重置表单 */
function handleClose() {
  emit('update:modelValue', false)
  formRef.value?.resetFields()
}

/** 提交表单：验证通过后 emit submit 事件 */
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
    }
  })
}
</script>
