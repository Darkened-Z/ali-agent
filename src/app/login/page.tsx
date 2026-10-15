import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  return (
    <section className="surface">
      <div className="form-stage">
        {error === "link" && (
          <p className="notice" style={{ gridColumn: "1 / -1" }}>
            That link has expired or was already used. Sign in, or request a new one.
          </p>
        )}
        <LoginForm next={typeof next === "string" ? next : "/admin"} />
      </div>
    </section>
  );
}
