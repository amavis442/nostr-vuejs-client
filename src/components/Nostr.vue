<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted } from "vue";
import NostrMessage from "./NostrMessage.vue";
import { pool, sendRequest } from "@/nostr/nostr";

//import { relayPool } from "nostr-tools";

import { useFollowStore } from "@/stores/follow";
import { useRelayStore } from "@/stores/relays";
import { useEventStore, type Event } from "@/stores/events";
import { useUserStore } from "@/stores/users";
import { follow, relays, maxEvents } from "@/settings";

const storeFollow = useFollowStore();
const storeRelay = useRelayStore();
const storeEvent = useEventStore();
const storeUser = useUserStore();

//const pool = relayPool();

storeRelay.add(relays[0]);
storeRelay.add(relays[1]);

follow.forEach((element) => {
  storeFollow.add(element);
});

function onMetaData(event: Event, _url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const { kind, content, pubkey } = event || {};
    if (!pubkey) return;
    let p: any = pubkey.toString();
    if (storeUser.get(p)) return;

    if (kind == 0) {
      let accountData = JSON.parse(content);
      if (accountData) {
        storeUser.add({
          pubkey: p,
          name: accountData.name ? accountData.name : "",
          about: accountData.about ? accountData.about : "",
          picture: accountData.picture ? accountData.picture : "",
        });
      }
    }
    resolve(storeUser);
  });
}

function onEvent(event: Event, _url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (event && event.kind == 1 && event.id && !storeEvent.get(event.id)) {
      storeEvent.add(event);
    }

    if (
      event &&
      event.kind == 0 &&
      event.pubkey &&
      !storeUser.get(event.pubkey)
    ) {
      let accountData = JSON.parse(event.content);
      if (accountData && accountData.name) {
        storeUser.add({
          pubkey: event.pubkey,
          name: accountData.name ? accountData.name : "",
          about: accountData.about ? accountData.about : "",
          picture: accountData.picture ? accountData.picture : "",
        });
      }
    }
    resolve(storeUser);
  });
}

async function getContacts() {
  console.log("Contacten ophalen");

  return await sendRequest(onMetaData, {
    authors: storeFollow.all(),
    kinds: [0],
  });
}

async function getEvents() {
  console.log("Events ophalen");
  return await sendRequest(onEvent, {
    //authors: storeFollow.all(),
    kinds: [0, 1],
    since: Date.now() / 1000 - 7 * 60 * 60 * 24,
    limit: maxEvents,
  });
}

async function getReplies() {
  // Check for event who are reply's and get the missing ones
  const replyIds: string[] = [];
  storeEvent.all().forEach((event: Event, key: string) => {
    let replyId = "";
    event.tags.forEach((element) => {
      if (element[0] == "e" && element[3] == "root") {
        replyId = element[1];
      }
    });

    if (replyId) {
      storeEvent.addReply(event.id, replyId);
      replyIds.push(replyId);
    }
  });

  if (replyIds.length > 0) {
    console.log("Replies ophalen");
    return await sendRequest(onEvent, {
      //authors: storeFollow.all(),
      kinds: [0, 1],
      "#e": replyIds,
      limit: maxEvents,
    });
  }
}

onMounted(async () => {
  storeRelay.all().forEach((element) => {
    pool.addRelay(element.relay, element.options);
  });

  await getContacts();
  await getEvents();
  await getReplies();
});
</script>
<style>
ul.no-bullets {
  list-style-type: none;
  /* Remove bullets */
  padding: 0;
  /* Remove padding */
  margin: 0;
  /* Remove margins */
}

:root {
  --color-primary: #333;
  --color-secondary: #999;
  --color-accent: lightblue;
  --color-accent-2: black;
  --background-color: #fff;
  --background-color-2: #eee;
  --background-color-3: #ddd;
  --background-accent: #2196f3;
}

* {
  padding: 0;
  margin: 0;
  border: none;
  text-decoration: none;
  list-style: none;
}

.chat {
  height: 100%;
}

.chat .content {
  flex: 1;
  flex-grow: 1;
  border-left: 1px solid var(--background-color-3);
  display: flex;
  flex-direction: column;
  /* background: url(../cartoons.png) repeat center center fixed; */
  background-size: 600px;
  overflow-y: scroll;
}

.chat .content .message-content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  overflow: auto;
  background-size: 600px;
  overflow-x: clip;
}

.chat .content .message-content * {
  max-width: calc(100vw - 20px);
}
</style>

<template>
  <div>
    <h1>
      Account: {{ storeUser.get(ourPubKey)?.name }}<br />
      <span style="font-size: small">{{
        storeUser.get(ourPubKey)?.about
      }}</span>
    </h1>
    <div class="chat">
      <div class="content">
        <div
          v-for="[key, value] in storeEvent.all()"
          :key="key"
          class="message-content"
        >
          <NostrMessage :event="value" />
        </div>
      </div>
    </div>
  </div>
</template>
