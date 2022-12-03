<template>
  <div class="message">
    <span class="picture"></span>
    <div class="bubble">
      <div class="author" :data-author="user?.pubkey">
        <img :src="user?.picture" class="profile" v-if="user?.picture" />
        <span class="colorFont">
          {{ author() }}
          <br />
          <small> {{ user?.about }}</small>
        </span>
      </div>
      <div class="msgtext">
        <span v-if="replyContent">
          <blockquote class="blockquote reply">
            <p class="mb-1 fst-italic fs-6">
              <font-awesome-icon icon="fa-solid fa-quote-left" />
              {{ replyContent }}
              <font-awesome-icon icon="fa-solid fa-quote-right" />
            </p>
            <footer class="blockquote-footer">{{ replyUser?.name }}</footer>
          </blockquote>
          <br />
        </span>

        {{ event.content }}
      </div>
      <div class="time bubbletime" :data-timestamp="event.created_at">
        {{ getTime() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Event } from "@/stores/events";
import { useUserStore, type User } from "@/stores/users";
import { useEventStore } from "@/stores/events";
import { colors } from "@/settings";

interface Props {
  event: Event;
}
const props = defineProps<Props>();
const storeUser = useUserStore();
const storeEvent = useEventStore();
const user = storeUser.get(props.event.pubkey);

let replyContent: string | null = null;
let replyUser: User | null = null;
const replyId = storeEvent.getReply(props.event.id);
if (replyId) {
  const replyEvent: Event | undefined = storeEvent.getFromMap(replyId);
  if (replyEvent) {
    replyContent = replyEvent.content;
    replyUser = storeUser.get(replyEvent.pubkey)
      ? storeUser.get(replyEvent.pubkey)
      : {
          pubkey: replyEvent.pubkey,
          name: replyEvent.pubkey,
          about: "",
          picture: "",
        };
  }
  if (!replyEvent) {
    console.log("We hebben een replyId, maar niet de event data");
  }
}

function myStyle() {
  let color = "#fc91a3";
  if (user?.pubkey) {
    color = colors[user.pubkey.toString().slice(0, 1).toLowerCase()];
  }
  return color;
}

const myColor = { color: myStyle() };

function getTime() {
  return new Date(props.event.created_at * 1000).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

function author() {
  return user?.name ? user?.name : props.event.pubkey;
}
</script>

<style>
.profile {
  width: 50px;
  height: 50px;
}

.reply {
  background-color: rgb(156, 156, 156);
  padding: 1em;
}

.colorFont {
  color: v-bind("myColor.color");
}

.chat .content .message-content .message {
  align-self: flex-start;
  margin-bottom: 20px;
  word-break: break-word;
  position: relative;
  width: 100%;
}

.chat .content .message-content .picture {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  vertical-align: middle;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.chat .content .message-content .bubble {
  display: inline-block;
  padding: 6px 12px;
  /* background-color: white; */
  background-color: var(--background-color-3);
  border-radius: 20px;
  font-size: 15px;
  margin-bottom: 5px;
  white-space: pre-wrap;
  vertical-align: middle;
  max-width: 50vw;
  transition: box-shadow 0.6s ease-in-out;
}

.chat .content .message-content .message .bubbletime {
  font-size: 11px;
  text-align: right;
  color: var(--color-secondary);
}

.chat .content .message-content .message .bubble .pink {
  color: #fc91a3;
}

.msgtext {
  color: black;
}
</style>
