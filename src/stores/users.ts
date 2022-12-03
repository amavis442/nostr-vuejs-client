import { defineStore } from "pinia";

export type User = {
  name: string;
  about: string;
  picture: string;
  pubkey: string;
};

export const useUserStore = defineStore("users", {
  state: () => {
    const users: { [key: string]: User } = {};

    return {
      users,
    };
  },
  actions: {
    add(user: User) {
      /*const user: User = {
        name: name,
        about: about,
        picture: picture,
        pubkey: pubkey,
      };*/
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
