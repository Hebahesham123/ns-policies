import { HeroSearch } from "@/features/search/hero-search";

export function Hero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden border-b">
      {/* ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--foreground)/0.04)_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <div className="container flex flex-col items-center py-20 text-center sm:py-28">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="size-1.5 rounded-full bg-success" /> قاعدة المعرفة الداخلية
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-balance text-lg text-muted-foreground">{subtitle}</p>

        <div className="mt-8 w-full">
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
