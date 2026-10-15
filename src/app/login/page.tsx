import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <section className="surface">
      <div className="form-stage">
        <LoginForm next={typeof next === "string" ? next : "/admin"} />
      </div>
    </section>
  );
}
