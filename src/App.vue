<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { follow, relays } from "@/settings";
import { useFollowStore } from "@/stores/follow";
import { useRelayStore } from "@/stores/relays";

const storeFollow = useFollowStore();
const storeRelay = useRelayStore();
storeRelay.add(relays[0]);
storeRelay.add(relays[1]);
follow.forEach((element) => {
  storeFollow.add(element);
});
</script>

<template>
  <div class="wrapper">
    <header>
      <nav class="nav flex-column">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/relays">Relays</RouterLink>
        <RouterLink to="/follow">Follow</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
        <RouterLink to="/settings">Settings</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  height: 100%;
  flex: 1;
}

.wrapper {
  display: flex;
  flex: 1;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    background-color: var(--vt-c-divider-light-2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header {
    width: 300px;
    max-width: 300px;
    display: flex;
    flex-direction: column;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
