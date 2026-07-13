<!--
  根组件

  仅作为路由出口，所有页面内容通过 <router-view /> 根据 URL 渲染。
  布局在 router 配置中通过 DefaultLayout / AdminLayout 实现。
-->
<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件无需额外逻辑，路由系统接管页面渲染
</script>
