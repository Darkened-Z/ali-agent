import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SideNav } from "@/components/SideNav";
import { getAdmin } from "@/lib/auth";
import { isTemporaryStorage } from "@/lib/store";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="admin-shell">
      <SideNav user={{ name: admin.name, email: admin.email, dev: !!admin.dev }} />
      <main className="admin-main">
        {isTemporaryStorage() && !admin.dev && (
          <div className="notice">
            Temporary mode: data is stored temporarily and can reset. Connect Supabase in Vercel to keep it.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
