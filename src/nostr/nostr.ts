import {
  relayPool,
  type Filter,
  type Subscription,
  type SubscriptionCallback,
} from "nostr-tools";
import { useUserStore } from "@/stores/users";
import { useRelayStore } from "@/stores/relays";
import { now } from "@/util/data";

export const pool = relayPool();

export async function sendRequest(filter: {}): Promise<Array<any>> {
  const channel = Math.random().toString().slice(2);
  const data: any = [];

  const relayStore = useRelayStore();
  const availableRelays = relayStore.relays.length;
  const eoseRelays: string[] = [];

  return new Promise((resolve) => {
    const sub = pool.sub(
      {
        cb: (e) => data.push(e),
        filter: filter,
      },
      channel,
      (url: string) => {
        eoseRelays.push(url);
        if (eoseRelays.length == availableRelays) {
          sub.unsub();
          resolve(data);
        }
      }
    );
  });
}

export function eventListener(onNote: SubscriptionCallback): Subscription {
  console.log('Start listening on channel: ', "listen");
  const filter: Filter = { kinds: [1, 5, 7], since: now() };

  return pool.sub(
    {
      cb: onNote,
      filter: filter,
    },
    "listen"
  );
}
