import { defineStore } from "pinia";

export type Relay = {
  relay: string;
  options: { read: boolean; write: boolean };
};

export const useRelayStore = defineStore("relays", {
  state: () => {
    return {
      relays: [] as Array<Relay>,
    };
  },
  actions: {
    add(relay: Relay) {
      if (!this.relays.find((element) => element.relay == relay.relay)) {
        this.relays.push(relay);
      }
    },
    remove(relay: string) {
      const a = this.relays.filter((element) => {
        return relay != element.relay;
      });
      this.relays = a;
    },
    all() {
      return this.relays;
    },
  },
});
