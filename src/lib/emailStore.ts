import { readDb, writeDb, type ContactRecord, type ContactStatus } from "./store";

export const ALL_CONTACTS = "__all";
export const ENGAGED_CONTACTS = "__engaged";
const ENGAGED_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

const isEngaged = (c: ContactRecord) =>
  !!c.lastEngagedAt && Date.now() - new Date(c.lastEngagedAt).getTime() < ENGAGED_WINDOW_MS;

export function audienceOf(contacts: ContactRecord[], list: string): ContactRecord[] {
  return contacts
    .filter(
      c =>
        c.status === "subscribed" &&
        (list === ALL_CONTACTS ||
          (list === ENGAGED_CONTACTS ? isEngaged(c) : c.lists.includes(list)))
    )
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function summarize(contacts: ContactRecord[]) {
  const lists = new Map<string, { name: string; total: number; subscribed: number }>();
  const byStatus: Record<ContactStatus, number> = {
    subscribed: 0,
    unsubscribed: 0,
    bounced: 0,
    complained: 0,
  };
  for (const c of contacts) {
    byStatus[c.status] += 1;
    for (const name of c.lists) {
      const entry = lists.get(name) ?? { name, total: 0, subscribed: 0 };
      entry.total += 1;
      if (c.status === "subscribed") entry.subscribed += 1;
      lists.set(name, entry);
    }
  }
  return {
    total: contacts.length,
    engaged: contacts.filter(c => c.status === "subscribed" && isEngaged(c)).length,
    byStatus,
    lists: [...lists.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

/** Suppression only moves away from "subscribed"; a bounce never gets overwritten by an unsubscribe and vice versa. */
export async function suppress(ids: string[], status: Exclude<ContactStatus, "subscribed">) {
  if (!ids.length) return 0;
  const db = await readDb({ lists: ["contacts"], ids: { contacts: ids } });
  const wanted = new Set(ids);
  let changed = 0;
  for (const c of db.contacts) {
    if (wanted.has(c.id) && c.status === "subscribed") {
      c.status = status;
      c.updatedAt = new Date().toISOString();
      changed += 1;
    }
  }
  await writeDb(db);
  return changed;
}

/** Opens and clicks from Resend's webhook; used for the "engaged" audience during warm-up. */
export async function markEngaged(ids: string[]) {
  if (!ids.length) return 0;
  const db = await readDb({ lists: ["contacts"], ids: { contacts: ids } });
  const wanted = new Set(ids);
  const now = new Date().toISOString();
  let changed = 0;
  for (const c of db.contacts) {
    if (wanted.has(c.id)) {
      c.lastEngagedAt = now;
      changed += 1;
    }
  }
  await writeDb(db);
  return changed;
}
