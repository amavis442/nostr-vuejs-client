<script setup lang="ts">
import Follow from "../components/Follow.vue";
</script>

<template>
  <main>
    <h1>To follow</h1>
    <hr/>
    <Follow />
  </main>
</template>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
