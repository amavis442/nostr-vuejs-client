<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted } from "vue";
import NostrMessage from "./NostrMessage.vue";
import { pool } from "@/nostr/nostr";
import { useFollowStore } from "@/stores/follow";
import { useRelayStore } from "@/stores/relays";
import { useEventStore } from "@/stores/events";
import type { Event, User } from "@/stores/index";

import { useUserStore } from "@/stores/users";
import { follow, relays, maxEvents } from "@/settings";
import type { Filter, Subscription } from "nostr-tools";

const storeFollow = useFollowStore();
const storeRelay = useRelayStore();
const storeEvent = useEventStore();
const storeUser = useUserStore();

storeRelay.add(relays[0]);
storeRelay.add(relays[1]);

follow.forEach((element) => {
  storeFollow.add(element);
});

function onMetaData(event: Event, _url: string): void {
  const { kind, content, pubkey } = event || {};
  if (!pubkey) return;
  let p: any = pubkey.toString();
  if (storeUser.get(p)) return;

  if (kind == 0) {
    let accountData = JSON.parse(content);
    if (accountData) {
      const user: User = {
        pubkey: p,
        name: accountData.name ? accountData.name : "",
        about: accountData.about ? accountData.about : "",
        picture: accountData.picture ? accountData.picture : "",
      };

      storeUser.add(user);
    }
  }
}

function onEvent(event: Event, _url: string): void {
  if (event && event.kind == 1 && event.id && !storeEvent.get(event.id)) {
    console.log("Event");
    const user: User | null = storeUser.get(event.pubkey);
    if (user) {
      event.user = user;
    }
    if (event.tags.length > 0) {
      event.tags.forEach((element) => {
        if (
          element[0] == "e" &&
          (element[3] == "root" || element[3] == "reply")
        ) {
          storeEvent.addReply(element[1], event.id, element[3]);
          let replyEvent: Event | null = storeEvent.get(element[1]);
          if (replyEvent) {
            event.reply = replyEvent;
          }
        }
      });
    }
    storeEvent.add(event);
  }

  if (event && event.kind == 0 && event.pubkey) {
    let userData = JSON.parse(event.content);
    let user: User;
    if (userData) {
      user = {
        pubkey: event.pubkey,
        name: userData.name ? userData.name : "",
        about: userData.about ? userData.about : "",
        picture: userData.picture ? userData.picture : "",
      };

      storeUser.add(user);

      // Need some way to trigger an update to storeEvent so the screen entry gets an update. Do not like looping through it every time we get an update from an relay.
      for (const [k, v] of storeEvent.all().entries()) {
        if (v.pubkey == user.pubkey) {
          storeEvent.setUser(k, user);
        }
      }
    }
  }
}

function onReply(event: Event, _url: string): void {
  if (event && event.kind == 1 && event.id && !storeEvent.get(event.id)) {
    const user: User | null = storeUser.get(event.pubkey);
    if (user) {
      event.user = user;
    }
    const replyData = storeEvent.getReply(event.id);
    if (replyData) {
      const user = storeUser.get(event.pubkey);
      if (user) {
        event.user = user;
      }
      storeEvent.setReply(replyData.id, event);
    }
    console.log("Reply From", replyData?.id, " To ", event.id);
  }
}

onMounted(async () => {
  storeRelay.all().forEach((element) => {
    pool.addRelay(element.relay, element.options);
  });
  const channel = Math.random().toString().slice(2);

  // Get the names of the ones we follow if present
  let filter: Filter = {
    kinds: [0],
    authors: storeFollow.all(),
  };

  let subscription: Subscription;
  let p = Promise.resolve();
  await new Promise((resolve) => {
    subscription = pool.sub(
      { cb: onMetaData, filter: filter },
      channel,
      (url: string) => {
        console.log("Eose: ", url);
        resolve(p);
      }
    );
    setTimeout(() => resolve(p), 1000);
  });

  // Get some events from 7 days with a max limit of 4000 records
  filter = {
    kinds: [0, 1],
    authors: storeFollow.all(),
    since: Date.now() / 1000 - 2 * 60 * 60 * 24, // Events from 2 days
    limit: 4000,
  };
  p = Promise.resolve();
  await new Promise((resolve) => {
    subscription.sub(
      { cb: onEvent, filter: filter },
      channel,
      (url: string) => {
        console.log("Eose: ", url);
        resolve(p);
      }
    );
    setTimeout(() => resolve(p), 4000);
  });

  // What are the some of the replies. This is kind of hit and miss because of async records from the previous action
  // can still come in after this function is called. Promise does not solve this because we do not know when all records are done
  // even when we get an EOSE (End Of Stored Events). That is why i use Timeouts until i find a better solution.
  let replyIds: any = [];
  storeEvent.getAllReplies().forEach((value: any, key: any) => {
    const e = storeEvent.get(value.id);
    if (e && !e.reply) {
      replyIds.push(key);
    }
  });

  if (replyIds.length > 0) {
    filter = {
      kinds: [0, 1],
      "#e": replyIds,
      limit: maxEvents,
    };
    p = Promise.resolve();
    await new Promise((resolve) => {
      subscription.sub(
        { cb: onReply, filter: filter },
        channel,
        (url: string) => {
          console.log("Eose: ", url);
          resolve(p);
        }
      );
      setTimeout(() => resolve(p), 500);
    });
  }
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
