"use server";

import { redirect } from "next/navigation";
import { createAuthClient, isAllowlisted } from "@/lib/auth";

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user.email) return { error: "Wrong email or password." };

  if (!(await isAllowlisted(data.user.email.toLowerCase()))) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have access to the admin desk." };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}
