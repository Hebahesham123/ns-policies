import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Icon } from "@/components/icon";

export function SectionHeader({
  icon,
  title,
  subtitle,
  href,
  hrefLabel = "عرض الكل",
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon name={icon} className="size-5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {hrefLabel}
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
