import { TopBar } from "@/components/TopBar";
import { SideNav } from "@/components/SideNav";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <TopBar />
      <div className="admin-shell">
        <SideNav />
        <div className="admin-main">{children}</div>
      </div>
    </>
  );
}
