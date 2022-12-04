<script setup lang="ts">
import Notes from "../components/Notes.vue";
</script>

<template>
  <main class="content">
    <Notes />
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
}
</style>
