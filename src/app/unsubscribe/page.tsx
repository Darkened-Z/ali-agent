import { verifyUnsubscribeToken } from "@/lib/email";
import { suppress } from "@/lib/emailStore";
import { readDb } from "@/lib/store";

async function unsubscribe(form: FormData) {
  "use server";
  const id = String(form.get("c") ?? "");
  const token = String(form.get("t") ?? "");
  if (id && verifyUnsubscribeToken(id, token)) await suppress([id], "unsubscribed");
}

// Unsubscribing takes a button press rather than happening on page load, because
// corporate link scanners open every URL in an email and would unsubscribe people silently.
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const { c, t } = await searchParams;
  const id = typeof c === "string" ? c : "";
  const token = typeof t === "string" ? t : "";
  const valid = Boolean(id && token && verifyUnsubscribeToken(id, token));
  const contact = valid
    ? (await readDb({ lists: ["contacts"], ids: { contacts: [id] } })).contacts.find(x => x.id === id)
    : undefined;
  const done = contact && contact.status !== "subscribed";

  return (
    <section className="surface">
      <div className="form-stage">
        <div className="form-frame">
          {!valid || !contact ? (
            <>
              <h1 className="form-q">Link not recognised</h1>
              <p className="form-sub">
                This unsubscribe link is invalid or expired. Reply to any of our emails and we&apos;ll
                remove you by hand.
              </p>
            </>
          ) : done ? (
            <>
              <h1 className="form-q">You&apos;re unsubscribed</h1>
              <p className="form-sub">
                <span className="mono">{contact.email}</span> won&apos;t get any more offer emails from us.
              </p>
            </>
          ) : (
            <form action={unsubscribe}>
              <h1 className="form-q">Unsubscribe?</h1>
              <p className="form-sub">
                Stop offer emails to <span className="mono">{contact.email}</span>.
              </p>
              <input type="hidden" name="c" value={id} />
              <input type="hidden" name="t" value={token} />
              <button className="btn lg primary" type="submit">
                Unsubscribe me
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
