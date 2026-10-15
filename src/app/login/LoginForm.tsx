"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="form-frame">
      <h1 className="form-q">Sign in</h1>
      <p className="form-sub">Admin desk · staff only. Ask an admin to add you if you don&apos;t have an account.</p>
      <input type="hidden" name="next" value={next} />
      <div className="form-input">
        <label htmlFor="email">EMAIL</label>
        <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <div className="form-input">
        <label htmlFor="password">PASSWORD</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && (
        <p className="form-sub" role="alert" style={{ color: "var(--danger, #d33)" }}>
          {state.error}
        </p>
      )}
      <button className="btn lg primary" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
