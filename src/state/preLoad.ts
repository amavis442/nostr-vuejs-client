import type { Event, User, NoteEvent } from "@/stores/index";

function processContacts(storeUser: any, data: Array<Event>): void {
  data.forEach((event) => {
    const { kind, content, pubkey } = event || {};
    if (!pubkey) return;
    const p: any = pubkey.toString();

    if (!storeUser.get(p) && kind == 0) {
      const accountData = JSON.parse(content);
      if (accountData) {
        const user: User = {
          pubkey: p,
          name: accountData.name ? accountData.name : "",
          about: accountData.about ? accountData.about : "",
          picture: accountData.picture ? accountData.picture : "",
        };

        storeUser.add(user);
      }
    }
  });
}

function processNotes(storeNote: any, storeUser: any, data: Array<Event>): void {
  const deletedNotes: string[] = [];
  data.forEach((event) => {
    let userData;
    let user: User;
    const note: NoteEvent = event;

    switch (note.kind) {
      case 1:
        if (
          !storeNote.get(note.id) &&
          !deletedNotes.find((element) => element == note.id)
        ) {
          const user: User | null = storeUser.get(note.pubkey);
          if (user) {
            note.user = user;
          }
          if (note.tags.length > 0) {
            note.tags.forEach((element) => {
              if (
                element[0] == "e" &&
                (element[3] == "root" || element[3] == "reply")
              ) {
                storeNote.addReply(element[1], note.id, element[3]);
                const replyEvent: Event | null = storeNote.get(element[1]);
                if (replyEvent) {
                  note.reply = replyEvent;
                }
              }
            });
          }
          storeNote.add(note);
        }
        break;
      case 5:
        if (storeNote.get(note.id)) {
          storeNote.remove(note.id);
        }
        deletedNotes.push(note.id);

        break;
      case 0:
        userData = JSON.parse(note.content);
        if (userData) {
          user = {
            pubkey: note.pubkey,
            name: userData.name ? userData.name : "",
            about: userData.about ? userData.about : "",
            picture: userData.picture ? userData.picture : "",
          };

          storeUser.add(user);

          for (const [k, v] of storeNote.all().entries()) {
            if (v.pubkey == user.pubkey) {
              storeNote.setUser(k, user);
            }
          }

          break;
        }
    }
  });
}

async function processReplies(storeNote: any, storeUser: any, data: Array<Event>): Promise<any> {
  return new Promise((resolve) => {
    data.forEach((event) => {
      const note: NoteEvent = event;

      if (note && note.kind == 1 && note.id && !storeNote.get(note.id)) {
        const user: User | null = storeUser.get(note.pubkey);
        if (user) {
          note.user = user;
        }
        const replyData = storeNote.getReply(note.id);
        if (replyData) {
          const user = storeUser.get(note.pubkey);
          if (user) {
            note.user = user;
          }
          storeNote.setReply(replyData.id, note);
        }
      }
    });
    resolve("Done replies");
  });
}

export default () => {
  return {
    processContacts,
    processNotes,
    processReplies,
  };
};
