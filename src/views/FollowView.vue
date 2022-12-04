<script setup lang="ts">
import Follow from "../components/Follow.vue";
</script>

<template>
  <main class="content">
    <h1>To follow</h1>
    <hr />
    <Follow />
  </main>
</template>
<style>
.content {
  flex: 2;
  border-left: 1px solid var(--background-color-3);
  display: flex;
  flex-direction: column;
  background-size: 600px;
  overflow-y: scroll;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
