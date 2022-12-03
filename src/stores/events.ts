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
    const events: { [key: string]: Event } = {};
    const map = new Map();
    const map2 = new Map();
    const replyMap = new Map();
    const str = "";
    return {
      events,
      map,
      map2,
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
        this.events[event.id] = event;
        this.map2.set(event.id, event);
        this.map.set(event.created_at, event);
      }
    },
    remove(id: string) {
      this.map.delete(this.events[id].created_at);
      this.map2.delete(id);
      this.replyMap.delete(id);
      delete this.events[id];
    },
    addReply(id: string, replyid: string) {
      this.map.set(id, replyid);
    },
    getReply(id: string) {
      return this.map.get(id);
    },
    getFromMap(id: string): Event | undefined {
      return this.map2.get(id);
    },
    getMap() {
      return this.map2;
    },
    all() {
      const sorted_map_by_str_values = new Map(
        [...this.map2.entries()].sort((a, b) => {
          return a[1].created_at - b[1].created_at;
        })
      );

      return sorted_map_by_str_values;
      //return new Map([...this.map.entries()].sort());
    },
    get(id: string): Event | null {
      if (this.events[id]) {
        return this.events[id];
      }
      return null;
    },
  },
});
