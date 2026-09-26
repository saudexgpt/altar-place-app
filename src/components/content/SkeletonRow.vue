<template>
  <div class="skeleton-row">
    <div v-for="n in count" :key="n" class="skeleton-card">
      <div class="skeleton-art app-skeleton" />
      <div class="skeleton-line skeleton-line--title app-skeleton" />
      <div class="skeleton-line skeleton-line--subtitle app-skeleton" />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 4 });
</script>

<style scoped>
.skeleton-row {
  display: flex;
  gap: 12px;
  overflow-x: hidden;
}

.skeleton-card {
  width: 130px;
  flex-shrink: 0;
}

.skeleton-art {
  width: 130px;
  height: 130px;
  margin-bottom: 8px;
}

.skeleton-line {
  height: 10px;
}

.skeleton-line--title {
  width: 80%;
  margin-bottom: 6px;
}

.skeleton-line--subtitle {
  width: 55%;
}
</style>
