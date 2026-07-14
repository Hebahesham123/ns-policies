import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export type Crumb = { label: ReactNode; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="inline-flex items-center hover:text-foreground">
        <Home className="size-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <ChevronLeft className="size-3.5" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">{item.label}</Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
