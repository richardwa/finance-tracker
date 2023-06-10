<script setup lang="ts">
import { ref } from 'vue'
import { endPoints } from '@/common/config'
const servertext = ref<string>('')
fetch(endPoints.hello)
  .then((r) => r.text())
  .then((r) => (servertext.value = r))
</script>
<template>
  <div>
    <h1>{{ servertext }}</h1>
  </div>
</template>

<style></style>
