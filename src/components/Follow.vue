<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFollowStore } from "@/stores/follow";
import { useUserStore } from "@/stores/users";

const storeFollow = useFollowStore();
const storeUser = useUserStore();
const publickey = ref<string>("");

function add() {
  if (publickey.value) {
    storeFollow.add(publickey.value);
    publickey.value = "";
  }
}

onMounted(() => {
  console.log(storeFollow.all());
});

function remove(pubkey: string) {
  storeFollow.remove(pubkey);
}
</script>

<template>
  <div>
    <div class="mb-3">
      <div class="row">
        <div class="col">
          <input
            type="text"
            v-model="publickey"
            placeholder="3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
            class="form-control"
            ref="publicKeyInput"
            id="publicKeyInput"
          />
        </div>
        <div class="col">
          <button @click="add" type="button" class="btn btn-primary mb-2">
            <font-awesome-icon icon="fa-solid fa-plus" />
          </button>
        </div>
      </div>
    </div>

    <div class="mb-3">
      {{ publickey }}
      <ol id="follow" class="list-group">
        <template v-for="item in storeFollow.all()" :key="item">
          <li v-if="item" class="list-group-item">
            <button @click="remove(item)" type="button" class="btn btn-primary">
              <font-awesome-icon icon="fa-solid fa-trash" />
            </button>
            <span class="p-3"><strong>{{ storeUser.get(item)?.name ? storeUser.get(item)?.name : "-" }}</strong>: ({{ item }})</span>
          </li>
        </template>
      </ol>
    </div>
  </div>
</template>
