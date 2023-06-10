<script setup lang="ts">
import LoadingSpinner from '@/client/components/LoadingSpinner.vue'
</script>
<template>
  <main :class="$style.main">
    <h2>Settings</h2>
    <div class="h-box center">
      <button>open</button>
      <loading-spinner />
    </div>
  </main>
</template>
<style module>
.main {
  margin-left: var(--gap);
}
</style>
