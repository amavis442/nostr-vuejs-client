import { defineStore } from "pinia";
import type { Event, User, NoteEvent } from "@/stores/index";

export const useNotesStore = defineStore("notes", {
  state: () => {
    const notes = new Map();
    const replyMap = new Map();
    const str = "";
    return {
      notes,
      replyMap,
      str,
    };
  },
  actions: {
    add(event: Event) {
      this.str += JSON.stringify(event) + "\n";
      if (
        event &&
        event.id &&
        event.content != "" &&
        event.pubkey != "" &&
        event.created_at > 0
      ) {
        this.notes.set(event.id, event);
      }
    },
    remove(id: string) {
      this.notes.delete(id);
      this.replyMap.delete(id);
    },
    addReply(id: string, replyToId: string, replyType: string) {
      this.replyMap.set(id, { id: replyToId, type: replyType });
    },
    getReply(id: string) {
      return this.replyMap.get(id);
    },
    getAllReplies() {
      return this.replyMap;
    },
    all() {
      const sorted_map_by_str_values = new Map(
        [...this.notes.entries()].sort((a, b) => {
          return a[1].created_at - b[1].created_at;
        })
      );

      return sorted_map_by_str_values;
    },
    setUser(id: string, user: User) {
      this.notes.get(id).user = user;
    },
    setReply(id: string, event: Event) {
      if (this.notes.get(id)) {
        this.notes.get(id).reply = event;
      } else {
        console.log("Do not have the reponse event yet to set reply data.");
      }
    },
    get(id: string): NoteEvent | null {
      if (this.notes.get(id)) {
        return this.notes.get(id);
      }
      return null;
    },
  },
});
