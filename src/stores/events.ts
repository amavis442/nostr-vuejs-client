import { defineStore } from "pinia";
import type { Event, User } from "@/stores/index";

export const useEventStore = defineStore("events", {
  state: () => {
    const events = new Map();
    const replyMap = new Map();
    const str = "";
    return {
      events,
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
        this.events.set(event.id, event);
      }
    },
    remove(id: string) {
      this.events.delete(id);
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
        [...this.events.entries()].sort((a, b) => {
          return a[1].created_at - b[1].created_at;
        })
      );

      return sorted_map_by_str_values;
    },
    setUser(id: string, user: User) {
      this.events.get(id).user = user;
    },
    setReply(id: string, event: Event) {
      if (this.events.get(id)) {
        this.events.get(id).reply = event;
      } else {
        console.log("Do not have the reponse event yet to set reply data.");
      }
    },
    get(id: string): Event | null {
      if (this.events.get(id)) {
        return this.events.get(id);
      }
      return null;
    },
  },
});
