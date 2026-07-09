"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ExternalLink, LogOut } from "lucide-react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { ADMIN_NAV, SITE } from "@/lib/constants";
import { adminLogout } from "@/actions/admin-auth";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e bg-card/50 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="size-4.5" />
        </span>
        <span className="truncate">{SITE.name}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
          <ExternalLink className="size-4" /> عرض الموقع
        </Link>
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">المظهر</span>
          <ThemeToggle />
        </div>
        <form action={adminLogout}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="size-4" /> تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
