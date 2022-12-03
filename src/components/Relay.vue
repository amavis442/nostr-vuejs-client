<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from "vue";
import { useRelayStore, type Relay } from "@/stores/relays";

const storeRelay = useRelayStore();
const relay = ref<string>("");
const read = ref<boolean>(true);
const write = ref<boolean>(true);

function add() {
  if (relay.value) {
    const r: Relay = {
      relay: relay.value,
      options: { read: read.value, write: write.value },
    };
    storeRelay.add(r);
    relay.value = "";
  }
}

function remove(relay: string) {
  storeRelay.remove(relay);
}
</script>

<template>
  <div>
    <div class="mb-3">
      <div class="row">
        <div class="col">
          <input
            type="text"
            v-model="relay"
            placeholder="edit me"
            class="form-control"
          />
        </div>
        <div class="col">
          <div class="form-check">
            <input
              type="checkbox"
              v-model="write"
              class="form-check-input"
              id="relayWrite"
            />
            <label class="form-check-label" for="relayWrite">write</label>
          </div>
          <div class="form-check">
            <input
              type="checkbox"
              v-model="read"
              class="form-check-input"
              id="relayRead"
            />
            <label class="form-check-label" for="relayRead">read</label>
          </div>
        </div>

        <div class="col">
          <button @click="add" type="button" class="btn btn-primary">
            <font-awesome-icon icon="fa-solid fa-plus" />
          </button>
        </div>
      </div>
    </div>
    <div class="mb-3">
      {{ relay }}
      <ol id="relay" class="list-group">
        <template v-for="relayData in storeRelay.all()" :key="relayData.relay">
          <li v-if="relayData" class="list-group-item">
            <button
              @click="remove(relayData.relay)"
              type="button"
              class="btn btn-primary"
            >
              <font-awesome-icon icon="fa-solid fa-trash" /></button
            ><span class="p-3">{{ relayData.relay }}</span>
          </li>
        </template>
      </ol>
    </div>
  </div>
</template>
