import {
  relayPool,
  type Subscription,
  type SubscriptionCallback,
} from "nostr-tools";
import { useUserStore } from "@/stores/users";

export const pool = relayPool();

export async function sendRequest(filter: {}): Promise<Array<any>> {
  const channel = Math.random().toString().slice(2);
  const data: any = [];
  return new Promise((resolve) => {
    const sub = pool.sub(
      {
        cb: (e) => data.push(e),
        filter: filter,
      },
      channel,
      () => {
        sub.unsub();
        resolve(data);
      }
    );
  });
}
