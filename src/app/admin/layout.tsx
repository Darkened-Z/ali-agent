import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SideNav } from "@/components/SideNav";
import { getAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="admin-shell">
      <SideNav user={{ name: admin.name, email: admin.email, dev: !!admin.dev }} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
