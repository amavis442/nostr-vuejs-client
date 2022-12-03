import { relayPool, type Subscription, type SubscriptionCallback } from "nostr-tools";
import { useUserStore } from "@/stores/users";

export const pool = relayPool();

export function sendRequest(callBack: SubscriptionCallback, filter: {}):Promise<Subscription> {
  return new Promise((resolve, reject) => {
    const channel = Math.random().toString().slice(2);
    const subscription = pool.sub(
      { cb: callBack, filter: filter },
      channel,
      (url: string) => {
        setTimeout(
        () => resolve(subscription), 500);
      }
    );

    setTimeout(() => {
      resolve(subscription);
    }, 500);
  });
}
