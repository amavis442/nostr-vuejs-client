export type User = {
  name: string;
  about: string;
  picture: string;
  pubkey: string;
};

export type Event = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[];
  content: string;
  sig: string;
  user?: User;
  reply?: Event;
};
