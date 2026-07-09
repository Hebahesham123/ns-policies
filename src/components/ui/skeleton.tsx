import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      {...props}
    >
      <div className="shimmer absolute inset-0 animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export { Skeleton };
