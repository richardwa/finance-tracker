<script setup lang="ts">
import { RouterView } from 'vue-router'
import { staticPaths } from './router'
</script>

<template>
  <nav :class="$style.nav">
    <RouterLink :class="$style.link" :to="staticPaths.inventory">
      <i class="fa fa-building-o" aria-hidden="true"></i>&nbsp;Inventory
    </RouterLink>
    <RouterLink :class="$style.link" :to="/staticPaths.report">
      <i class="fa fa-line-chart" aria-hidden="true"></i>&nbsp;Report
    </RouterLink>
    <RouterLink :class="$style.link" :to="staticPaths.settings">
      <i class="fa fa-cog" aria-hidden="true"></i>&nbsp;Settings
    </RouterLink>
  </nav>
  <RouterView />
</template>
<style module>
.nav {
  display: flex;
  flex-direction: row;
  background-color: rgba(200, 200, 200, 0.9);
  border: 1px solid gray;
  align-items: center;
  height: var(--header-height);
}

.link {
  margin: 0;
  min-width: 8rem;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-right: 1px solid gray;
}
</style>
