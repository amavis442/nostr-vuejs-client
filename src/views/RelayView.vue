<script setup lang="ts">
import Relay from "../components/Relay.vue";
</script>

<template>
  <main>
    <h1>Some relays to get data from (around 5)</h1>
    <hr/>
    <Relay />
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
