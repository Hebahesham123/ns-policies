import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/access/guard";
import { ADMIN_NAV } from "@/lib/constants";
import { Icon } from "@/components/icon";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin(); // defense-in-depth (middleware already gates /admin)

  return (
    <div className="flex min-h-dvh bg-muted/20">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top nav */}
        <div className="flex gap-1 overflow-x-auto border-b bg-card p-2 lg:hidden scrollbar-thin">
          {ADMIN_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
              <Icon name={item.icon} className="size-4" /> {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
