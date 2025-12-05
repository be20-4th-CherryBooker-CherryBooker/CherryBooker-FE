<script setup>
import NavigationBar from "@/components/NavigationBar.vue";
</script>

<template>
  <div class="app-container">
    <!-- 공통 네비게이션 -->
    <NavigationBar />

    <!-- 페이지가 바뀌는 영역 -->
    <router-view />
  </div>
</template>

<style>
.app-container {
  font-family: "Pretendard", sans-serif;
}
</style>
