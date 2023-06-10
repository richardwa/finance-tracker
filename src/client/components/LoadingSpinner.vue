<script setup lang="ts"></script>
<template>
  <i :class="[$style.circle, 'fa-spin']"></i>
</template>
<style module>
.circle {
  border: 1px solid gray;
  border-top: none;
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
}
</style>
