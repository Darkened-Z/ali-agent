import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readDb } from "./store";

export type Admin = { email: string };

function authKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

export async function createAuthClient() {
  const keys = authKeys();
  if (!keys) throw new Error("Supabase Auth is not configured");
  const cookieStore = await cookies();
  return createServerClient(keys.url, keys.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export async function isAllowlisted(email: string): Promise<boolean> {
  const bootstrap = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  if (bootstrap.includes(email)) return true;
  const db = await readDb({ lists: ["team"] });
  return db.team.some(m => m.email.toLowerCase() === email);
}

/**
 * A Supabase session alone isn't enough: anyone can sign up against a project with public
 * sign-ups enabled, so the email must also be in ADMIN_EMAILS or on the Team page.
 */
export async function getAdmin(): Promise<Admin | null> {
  if (!authKeys()) {
    return process.env.NODE_ENV === "production" ? null : { email: "dev@localhost" };
  }
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !(await isAllowlisted(email))) return null;
  return { email };
}

export async function requireAdmin(): Promise<Response | null> {
  return (await getAdmin()) ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
