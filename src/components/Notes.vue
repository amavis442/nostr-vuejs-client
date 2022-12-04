<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { onMounted } from "vue";
import Note from "./Note.vue";
import { pool, sendRequest, eventListener } from "@/nostr/nostr";
import { useFollowStore } from "@/stores/follow";
import { useRelayStore } from "@/stores/relays";
import { useNotesStore } from "@/stores/notes";
import type { Event, User, NoteEvent } from "@/stores/index";

import { useUserStore } from "@/stores/users";
import { follow, relays, maxEvents } from "@/settings";
import type { Filter } from "nostr-tools";

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

function onEvent(event: Event, url: string): void {
  let userData;
  let user: User;
  let note: NoteEvent = event;
  switch (note.kind) {
    case 1:
      if (!storeNote.get(note.id)) {
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
      break;
    case 5:
      if (storeNote.get(note.id)) {
        storeNote.remove(note.id);
      }
      break;
    case 0:
      userData = JSON.parse(note.content);
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

        break;
      }
  }
}

function processNotes(data: Array<Event>): void {
  const deletedNotes: string[] = [];
  data.forEach((event) => {
    let userData;
    let user: User;
    let note: NoteEvent = event;

    switch (note.kind) {
      case 1:
        if (
          !storeNote.get(note.id) &&
          !deletedNotes.find((element) => element == note.id)
        ) {
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
        break;
      case 5:
        if (storeNote.get(note.id)) {
          storeNote.remove(note.id);
        }
        deletedNotes.push(note.id);

        break;
      case 0:
        userData = JSON.parse(note.content);
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

          break;
        }
    }
  });
}

async function processReplies(data: Array<Event>): Promise<any> {
  return new Promise((resolve) => {
    data.forEach((event) => {
      let note: NoteEvent = event;

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
      }
    });
    resolve("Done replies");
  });
}

onMounted(async () => {
  storeRelay.all().forEach((element) => {
    pool.addRelay(element.relay, element.options);
  });

  // Get some events from 7 days with a max limit of 4000 records
  let filter: Filter = {
    kinds: [1, 5, 7],
    //authors: storeFollow.all(),
    since: Date.now() / 1000 - 2 * 60 * 60 * 24, // Events from 2 days
    limit: 50,
  };
  const noteData = await sendRequest(filter);

  let pubKeys: any = [];
  noteData.forEach((value: any, key: any) => {
    pubKeys.push(value.pubkey);
  });
  filter = {
    kinds: [0],
    authors: pubKeys,
  };
  const contactData = await sendRequest(filter);
  processContacts(contactData);
  processNotes(noteData);

  let replyIds: any = [];
  storeNote.getAllReplies().forEach((value: any, key: any) => {
    const e = storeNote.get(value.id);
    if (e && !e.reply) {
      replyIds.push(key);
    }
  });

  if (replyIds.length > 0) {
    filter = {
      kinds: [0, 1, 5],
      "#e": replyIds,
      limit: maxEvents,
    };

    const replyData = await sendRequest(filter);
    await processReplies(replyData);
  }
  // @ts-ignore
  eventListener(onEvent);
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

.content .message-content {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background-size: 600px;
}

.content .message-content * {
  max-width: calc(100vw - 20px);
}
</style>

<template>
  <div
    v-for="[key, note] in storeNote.all()"
    :key="key"
    class="message-content"
  >
    <Note :note="note" />
  </div>
</template>
