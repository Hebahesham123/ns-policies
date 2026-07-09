import { Icon } from "@/components/icon";
import { Card } from "@/components/ui/card";
import { cn, formatCompact } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = "#6366f1",
  className,
}: {
  label: string;
  value: number | string;
  icon: string;
  hint?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <Card className={cn("flex items-center gap-4 p-5", className)}>
      <div className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${accent}1a`, color: accent }}>
        <Icon name={icon} className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight">
          {typeof value === "number" ? formatCompact(value) : value}
        </p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
