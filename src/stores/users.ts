import { defineStore } from "pinia";
import type { User } from "@/stores/index";

export const useUserStore = defineStore("users", {
  state: () => {
    const users: { [key: string]: User } = {};

    return {
      users,
    };
  },
  actions: {
    add(user: User) {
      this.users[user.pubkey] = user;
    },
    remove(pubKey: string) {
      delete this.users[pubKey];
    },
    all() {
      return this.users;
    },
    get(pubkey: string): User | null {
      if (this.users[pubkey]) {
        return this.users[pubkey];
      }
      return null;
    },
  },
});
