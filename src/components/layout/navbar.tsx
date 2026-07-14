"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import * as React from "react";
import { CommandPalette } from "@/features/search/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/lang/language-toggle";
import { Bi } from "@/components/lang/bi";
import { Button } from "@/components/ui/button";
import { NAV, SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 border-b glass">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">NS</span>
          <span className="hidden sm:inline">{SITE.name}</span>
        </Link>

        <nav className="ms-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Bi ar={item.label} en={item.en} />
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <CommandPalette />
          <LanguageToggle />
          <ThemeToggle />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/admin"><Bi ar="لوحة التحكم" en="Admin" /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="القائمة">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t md:hidden">
          <nav className="container flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Bi ar={item.label} en={item.en} />
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary">
              <Bi ar="لوحة تحكم الإدارة" en="Admin dashboard" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
