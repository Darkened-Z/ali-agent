import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readDb } from "./store";

/** `name` comes from the Team page; the owner (and local dev) default to Ali. */
export type Admin = { email: string; name: string; dev?: boolean };

const DEFAULT_NAME = "Ali";

function authKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

// Until Supabase is connected, the admin desk is guarded by a single ADMIN_PASSWORD instead.
const PASSWORD_COOKIE = "pt_admin";

export function passwordMode(): boolean {
  return !authKeys() && !!process.env.ADMIN_PASSWORD?.trim();
}

function passwordSessionToken(): string {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD!.trim())
    .update("proxytech-admin-session")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function checkAdminPassword(password: string): boolean {
  return passwordMode() && safeEqual(password, process.env.ADMIN_PASSWORD!.trim());
}

export async function startPasswordSession() {
  (await cookies()).set(PASSWORD_COOKIE, passwordSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function endPasswordSession() {
  (await cookies()).delete(PASSWORD_COOKIE);
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

async function lookupStaff(email: string): Promise<{ allowed: boolean; name: string }> {
  const db = await readDb({ lists: ["team"] });
  const member = db.team.find(m => m.email.toLowerCase() === email);
  const bootstrap = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
  return { allowed: !!member || bootstrap.includes(email), name: member?.name || DEFAULT_NAME };
}

export async function isAllowlisted(email: string): Promise<boolean> {
  return (await lookupStaff(email)).allowed;
}

/**
 * A Supabase session alone isn't enough: anyone can sign up against a project with public
 * sign-ups enabled, so the email must also be in ADMIN_EMAILS or on the Team page.
 */
export async function getAdmin(): Promise<Admin | null> {
  if (!authKeys()) {
    if (passwordMode()) {
      const token = (await cookies()).get(PASSWORD_COOKIE)?.value ?? "";
      return safeEqual(token, passwordSessionToken()) ? { email: "admin", name: DEFAULT_NAME } : null;
    }
    return process.env.NODE_ENV === "production" ? null : { email: "dev@localhost", name: DEFAULT_NAME, dev: true };
  }
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email) return null;
  const staff = await lookupStaff(email);
  return staff.allowed ? { email, name: staff.name } : null;
}

export async function requireAdmin(): Promise<Response | null> {
  return (await getAdmin()) ? null : Response.json({ error: "Unauthorized" }, { status: 401 });
}
