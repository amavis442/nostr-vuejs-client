<template>
  <div class="message">
    <span class="picture"></span>
    <div class="bubble">
      <div class="author" :data-author="note.user?.pubkey">
        <img :src="note.user?.picture" class="profile picture" v-if="note.user?.picture" />
        <span class="note-text-color p-2" :id="note.id">
          {{ author(note) }}
          <br />
          <small class="text-muted fst-italic"> {{ note.user?.about }}</small>
        </span>
      </div>
      <hr />
      <div class="msgtext">
        <span v-if="note.reply?.content">
          <blockquote class="blockquote reply">
            <p class="mb-1 p-3 fst-italic fs-6">
              <font-awesome-icon icon="fa-solid fa-quote-left" />
              {{ note.reply?.content }}
              <font-awesome-icon icon="fa-solid fa-quote-right" />
            </p>
            <footer class="blockquote-footer"><small>{{ note.reply?.user?.name ?  note.reply?.pubkey : "" }}</small></footer>
          </blockquote>
          <br />
        </span>
        <span v-html="getNoteContent()"></span>
      </div>
      <div class="time bubbletime" :data-timestamp="note.created_at">
        {{ getTime(note.created_at) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NoteEvent } from "@/stores/index";
import { colors } from "@/settings";
import { toHtml } from "@/util/html";
import { getTime } from "@/util/data";
interface Props {
  note: NoteEvent;
}
const props = defineProps<Props>();

function getNoteContent() {
  const noteContent = props.note.content;
  return toHtml(noteContent);
}

function myStyle() {
  let color = "#fc91a3";
  if (props.note.pubkey) {
    color = colors[props.note.pubkey.toString().slice(0, 1).toLowerCase()];
  }
  return color;
}

const myColor = { color: myStyle() };

function author(event: NoteEvent): string {
  return event.user?.name ? event.user?.name : event.pubkey;
}
</script>

<style>
.content .message-content .message {
  align-self: flex-start;
  margin-bottom: 20px;
  word-break: break-word;
  position: relative;
  width: 100%;
}

.content .message-content .message .bubble {
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

.content .message-content .message .bubble .reply {
  background-color: rgb(156, 156, 156);
  padding: 1em;
  border-radius: 20px;
}

.content .message-content .message .bubble .note-text-color {
  color: v-bind("myColor.color");
}

.content .message-content .message .bubble .picture {
  display: inline-block;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  vertical-align: middle;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.content .message-content .message .bubble .bubbletime {
  font-size: 11px;
  text-align: right;
  color: var(--color-secondary);
}

.content .message-content .message .bubble .pink {
  color: #fc91a3;
}

.content .message-content .message .bubble .msgtext {
  color: black;
}
</style>
