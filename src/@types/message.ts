import type { Hex } from "nostr-tools";

export type Message = {
  id?: Hex | string;
  author: string;
  created: string;
  content: string;
  timestamp: number;
  authorid?: string;
  picture?: string;
  about?: string;
};
