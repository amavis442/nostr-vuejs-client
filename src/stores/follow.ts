import { defineStore } from "pinia";

export const useFollowStore = defineStore("follow", {
  state: () => {
    return {
      follow: [] as Array<string>,
    };
  },
  actions: {
    add(pubKey: string) {
      if (!this.follow.find((element) => element == pubKey)) {
        this.follow.push(pubKey);
      }
    },
    remove(pubKey: string) {
      const a = this.follow.filter((element) => {
        return pubKey != element;
      });
      this.follow = a;
    },
    all() {
      return this.follow;
    },
    count() {
      return this.follow.length;
    }
  },
});
