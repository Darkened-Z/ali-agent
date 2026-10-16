"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hit } from "@/lib/rateLimit";
import {
  checkAdminPassword,
  createAuthClient,
  endPasswordSession,
  isAllowlisted,
  passwordMode,
  startPasswordSession,
} from "@/lib/auth";
import { appUrl } from "@/lib/email";

export type LoginState = { error?: string; notice?: string };

const MIN_PASSWORD = 8;

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  const destination = next.startsWith("/admin") ? next : "/admin";

  if (passwordMode()) {
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!(await hit(`login:${ip}`, 10, 600))) return { error: "Too many attempts. Try again in 10 minutes." };
    if (!checkAdminPassword(password)) return { error: "Wrong password." };
    await startPasswordSession();
    redirect(destination);
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error?.code === "email_not_confirmed") {
    return { error: "Confirm your email first: open the link we sent you, then sign in." };
  }
  if (error || !data.user.email) return { error: "Wrong email or password." };

  if (!(await isAllowlisted(data.user.email.toLowerCase()))) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the admin desk." };
  }

  redirect(destination);
}

/** Only emails in ADMIN_EMAILS or on the Team page can create an account; anyone else is refused before Supabase is called. */
export async function signUp(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!(await isAllowlisted(email))) {
    return { error: "That email isn't on the staff list. Ask an admin to add you on the Team page." };
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters for your password.` };
  }

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${appUrl()}/auth/callback?next=/admin` },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/admin");
  return { notice: `We've emailed a confirmation link to ${email}. Open it, then sign in here.` };
}

export async function requestPasswordReset(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (await isAllowlisted(email)) {
    const supabase = await createAuthClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl()}/auth/callback?next=/login/reset`,
    });
  }
  // Same answer either way, so the form can't be used to discover staff emails.
  return { notice: "If that email has an account, a reset link is on its way." };
}

export async function updatePassword(_prev: LoginState, form: FormData): Promise<LoginState> {
  const password = String(form.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters for your password.` };
  }
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "That reset link has expired. Request a new one from the sign-in page." };
  redirect("/admin");
}

export async function signOut() {
  if (passwordMode()) {
    await endPasswordSession();
  } else {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
