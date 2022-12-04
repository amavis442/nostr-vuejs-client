import { type Event as NostrEvent } from "nostr-tools";

export type User = {
  name: string;
  about: string;
  picture: string;
  pubkey: string;
};

export type Event = NostrEvent & {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[];
  content: string;
  sig: string;
};

export type NoteEvent = Event & {
  user?: User;
  reply?: Event;
};

export type SubscriptionCallback = (event: Event, relay: string) => void;
