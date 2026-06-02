<template>
  <transition name="fade" mode="out-in">
    <router-view v-slot="{ Component }">
      <div :key="$route.path" class="page-wrapper">
        <component :is="Component" />
      </div>
    </router-view>
  </transition>
</template>

<script setup>
</script>

<style scoped>
.page-wrapper {
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>