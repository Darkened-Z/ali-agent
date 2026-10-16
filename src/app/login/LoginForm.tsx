"use client";

import { useActionState, useState } from "react";
import { requestPasswordReset, signIn, signUp, type LoginState } from "./actions";

type Mode = "signin" | "signup" | "reset";

const COPY: Record<Mode, { title: string; sub: string; button: string; busy: string }> = {
  signin: {
    title: "Sign in",
    sub: "Admin desk · staff only.",
    button: "Sign in",
    busy: "Signing in…",
  },
  signup: {
    title: "Create your account",
    sub: "For staff whose email is on the team list. You'll confirm by email.",
    button: "Create account",
    busy: "Creating…",
  },
  reset: {
    title: "Reset password",
    sub: "We'll email you a link to choose a new password.",
    button: "Send reset link",
    busy: "Sending…",
  },
};

const ACTIONS = { signin: signIn, signup: signUp, reset: requestPasswordReset };

function ModeForm({
  mode,
  next,
  passwordOnly,
  onSwitch,
}: {
  mode: Mode;
  next: string;
  passwordOnly: boolean;
  onSwitch: (m: Mode) => void;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(ACTIONS[mode], {});
  const copy = COPY[mode];

  return (
    <form action={action} className="form-frame" style={{ minHeight: 0 }}>
      <h1 className="form-q">{copy.title}</h1>
      <p className="form-sub">{copy.sub}</p>
      <input type="hidden" name="next" value={next} />
      {!passwordOnly && (
        <div className="form-input">
          <label htmlFor="email">EMAIL</label>
          <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
        </div>
      )}
      {mode !== "reset" && (
        <div className="form-input">
          <label htmlFor="password">{mode === "signup" ? "CHOOSE A PASSWORD (8+ CHARACTERS)" : "PASSWORD"}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            autoFocus={passwordOnly}
            required
          />
        </div>
      )}
      {state.error && (
        <p className="form-sub" role="alert" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      )}
      {state.notice && (
        <p className="form-sub" role="status" style={{ color: "var(--ok)" }}>
          {state.notice}
        </p>
      )}
      <button className="btn lg primary" type="submit" disabled={pending}>
        {pending ? copy.busy : copy.button}
      </button>
      <div style={{ display: "flex", gap: 16, marginTop: 20, fontSize: 13, flexWrap: "wrap" }}>
        {mode !== "signin" && (
          <button type="button" className="btn ghost" onClick={() => onSwitch("signin")}>
            Back to sign in
          </button>
        )}
        {mode === "signin" && !passwordOnly && (
          <>
            <button type="button" className="btn ghost" onClick={() => onSwitch("signup")}>
              First time? Create your account
            </button>
            <button type="button" className="btn ghost" onClick={() => onSwitch("reset")}>
              Forgot password
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export function LoginForm({ next, passwordOnly }: { next: string; passwordOnly: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  // Keyed so each mode gets its own form state.
  return <ModeForm key={mode} mode={mode} next={next} passwordOnly={passwordOnly} onSwitch={setMode} />;
}
