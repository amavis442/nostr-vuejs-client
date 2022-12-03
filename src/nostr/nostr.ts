import {
  relayPool,
  type Subscription,
  type SubscriptionCallback,
} from "nostr-tools";
import { useUserStore } from "@/stores/users";

export const pool = relayPool();

export function sendRequest(
  callBack: SubscriptionCallback,
  filter: {},
  label?: string
): Subscription {
  console.log("Sending request: ", label);

  const channel = Math.random().toString().slice(2);
  return pool.sub(
    {
      cb: callBack,
      filter: filter,
    },
    channel,
    (url: string) => {
      console.log("Eose: ", url);
    }
  );
}
