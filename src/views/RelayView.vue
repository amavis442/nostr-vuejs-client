<script setup lang="ts">
import Relay from "../components/Relay.vue";
</script>

<template>
  <main class="content">
    <h1>Some relays to get data from (around 5)</h1>
    <hr />
    <Relay />
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
