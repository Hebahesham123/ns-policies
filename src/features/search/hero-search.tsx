"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { debounce } from "@/lib/utils";

type Suggestion = { title: string; slug: string };

/** Prominent homepage search with instant suggestions dropdown. */
export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);

  const run = React.useMemo(
    () =>
      debounce(async (value: string) => {
        if (value.trim().length < 2) return setItems([]);
        const supabase = getSupabaseBrowser();
        const { data } = await supabase.rpc("search_suggestions", { p_query: value, p_limit: 6 });
        setItems((data as Suggestion[]) ?? []);
      }, 220),
    [],
  );

  React.useEffect(() => {
    run(q);
  }, [q, run]);

  const submit = (value: string) => {
    if (value.trim()) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="ابحث في السياسات والإجراءات والأدلة…"
          className="h-14 w-full rounded-2xl border bg-background/80 ps-12 pe-28 text-base shadow-soft-lg backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="البحث في قاعدة المعرفة"
        />
        <button
          type="submit"
          className="absolute end-2 top-1/2 h-10 -translate-y-1/2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          البحث
        </button>
      </form>

      {open && items.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border bg-popover shadow-soft-lg">
          {items.map((it) => (
            <li key={it.slug}>
              <button
                onMouseDown={() => router.push(`/articles/${it.slug}`)}
                className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm hover:bg-accent"
              >
                <Search className="size-4 text-muted-foreground" />
                <span className="truncate">{it.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
