<script setup lang="ts">
defineEmits(['close'])
</script>
<template>
  <main>
    <div :class="$style.overlay" @click="$emit('close')">
      <div :class="$style.content">
        <slot />
      </div>
    </div>
  </main>
</template>
<style module>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  max-width: calc(100vw - 10rem);
  max-height: calc(100vh - 10rem);
}
</style>
