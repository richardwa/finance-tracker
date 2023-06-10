<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { staticPaths } from './router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink :class="$style.link" :to="staticPaths.home">Home</RouterLink> |
        <RouterLink :class="$style.link" :to="staticPaths.hello">Server</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style module>
nav {
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
}
.link {
  padding: 1rem 2rem;
  font-size: larger;
  border: 1px solid gray;
  border-collapse: collapse;
  margin-right: -1px;
  width: 10rem;
  text-align: center;
}
</style>
