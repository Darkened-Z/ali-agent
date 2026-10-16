"use client";

import { useActionState } from "react";
import { updatePassword, type LoginState } from "../actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(updatePassword, {});
  return (
    <section className="surface">
      <div className="form-stage">
        <form action={action} className="form-frame" style={{ minHeight: 0 }}>
          <h1 className="form-q">Choose a new password</h1>
          <p className="form-sub">At least 8 characters.</p>
          <div className="form-input">
            <label htmlFor="password">NEW PASSWORD</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required autoFocus />
          </div>
          {state.error && (
            <p className="form-sub" role="alert" style={{ color: "var(--danger)" }}>
              {state.error}
            </p>
          )}
          <button className="btn lg primary" type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save and sign in"}
          </button>
        </form>
      </div>
    </section>
  );
}
