import { defineStore } from "pinia";

export type Event = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[];
  content: string;
  sig: string;
};

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
    addReply(id: string, replyid: string) {
      this.replyMap.set(id, replyid);
    },
    getReply(id: string) {
      return this.replyMap.get(id);
    },
    all() {
      const sorted_map_by_str_values = new Map(
        [...this.events.entries()].sort((a, b) => {
          return a[1].created_at - b[1].created_at;
        })
      );

      return sorted_map_by_str_values;
    },
    get(id: string): Event | null {
      if (this.events.get(id)) {
        return this.events.get(id);
      }
      return null;
    },
  },
});
