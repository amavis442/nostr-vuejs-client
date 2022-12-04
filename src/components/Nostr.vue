<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted } from "vue";
import NostrMessage from "./NostrMessage.vue";
import { pool, sendRequest } from "@/nostr/nostr";
import { useFollowStore } from "@/stores/follow";
import { useRelayStore } from "@/stores/relays";
import { useNotesStore } from "@/stores/notes";
import type { Event, User } from "@/stores/index";

import { useUserStore } from "@/stores/users";
import { follow, relays, maxEvents } from "@/settings";
import type { Filter, Subscription } from "nostr-tools";

const storeFollow = useFollowStore();
const storeRelay = useRelayStore();
const storeNote = useNotesStore();
const storeUser = useUserStore();

storeRelay.add(relays[0]);
storeRelay.add(relays[1]);

follow.forEach((element) => {
  storeFollow.add(element);
});

function processContacts(data: Array<Event>): void {
  data.forEach((event) => {
    const { kind, content, pubkey } = event || {};
    if (!pubkey) return;
    let p: any = pubkey.toString();

    if (!storeUser.get(p) && kind == 0) {
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
  });
}

function processNotes(data: Array<Event>): void {
  data.forEach((note) => {
    if (note && note.kind == 1 && note.id && !storeNote.get(note.id)) {
      const user: User | null = storeUser.get(note.pubkey);
      if (user) {
        note.user = user;
      }
      if (note.tags.length > 0) {
        note.tags.forEach((element) => {
          if (
            element[0] == "e" &&
            (element[3] == "root" || element[3] == "reply")
          ) {
            storeNote.addReply(element[1], note.id, element[3]);
            let replyEvent: Event | null = storeNote.get(element[1]);
            if (replyEvent) {
              note.reply = replyEvent;
            }
          }
        });
      }
      storeNote.add(note);
    }

    if (note && note.kind == 0 && note.pubkey) {
      let userData = JSON.parse(note.content);
      let user: User;
      if (userData) {
        user = {
          pubkey: note.pubkey,
          name: userData.name ? userData.name : "",
          about: userData.about ? userData.about : "",
          picture: userData.picture ? userData.picture : "",
        };

        storeUser.add(user);

        for (const [k, v] of storeNote.all().entries()) {
          if (v.pubkey == user.pubkey) {
            storeNote.setUser(k, user);
          }
        }
      }
    }
  });
}

function processReplies(data: Array<Event>): void {
  data.forEach((note) => {
    if (note && note.kind == 1 && note.id && !storeNote.get(note.id)) {
      const user: User | null = storeUser.get(note.pubkey);
      if (user) {
        note.user = user;
      }
      const replyData = storeNote.getReply(note.id);
      if (replyData) {
        const user = storeUser.get(note.pubkey);
        if (user) {
          note.user = user;
        }
        storeNote.setReply(replyData.id, note);
      }
      console.log("Reply From", replyData?.id, " To ", note.id);
    }
  });
}

onMounted(async () => {
  storeRelay.all().forEach((element) => {
    pool.addRelay(element.relay, element.options);
  });
  // Get the names of the ones we follow if present
  let filter: Filter = {
    kinds: [0],
    authors: storeFollow.all(),
  };

  let data = await sendRequest(filter);
  processContacts(data);

  // Get some events from 7 days with a max limit of 4000 records
  filter = {
    kinds: [1, 5, 7],
    authors: storeFollow.all(),
    since: Date.now() / 1000 - 2 * 60 * 60 * 24, // Events from 2 days
    limit: 50,
  };
  data = await sendRequest(filter);
  processNotes(data);

  let replyIds: any = [];
  storeNote.getAllReplies().forEach((value: any, key: any) => {
    const e = storeNote.get(value.id);
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

    data = await sendRequest(filter);
    processReplies(data);
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
          v-for="[key, value] in storeNote.all()"
          :key="key"
          class="message-content"
        >
          <NostrMessage :event="value" />
        </div>
      </div>
    </div>
  </div>
</template>
