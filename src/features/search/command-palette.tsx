"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, Hash, ArrowLeft, Loader2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { debounce } from "@/lib/utils";

type Suggestion = { title: string; slug: string };

/**
 * Global command palette (Cmd/Ctrl + K). Debounced instant search against the
 * search_suggestions RPC; Enter runs a full search.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const run = React.useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.trim().length < 2) {
          setItems([]);
          setLoading(false);
          return;
        }
        const supabase = getSupabaseBrowser();
        const { data } = await supabase.rpc("search_suggestions", { p_query: q, p_limit: 7 });
        setItems((data as Suggestion[]) ?? []);
        setLoading(false);
      }, 220),
    [],
  );

  React.useEffect(() => {
    setLoading(query.trim().length >= 2);
    run(query);
  }, [query, run]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent"
        aria-label="فتح البحث"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">ابحث…</span>
        <kbd className="ms-2 hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-popover shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <Command shouldFilter={false} className="[&_[cmdk-input]]:outline-none">
              <div className="flex items-center gap-2 border-b px-4">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder="ابحث في المقالات والمواضيع والكلمات المفتاحية…"
                  className="h-12 flex-1 bg-transparent text-sm placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                />
                {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              </div>
              <Command.List className="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin">
                {!loading && query.trim().length >= 2 && items.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">لا توجد نتائج لـ ”{query}“.</div>
                )}
                {items.map((it) => (
                  <Command.Item
                    key={it.slug}
                    value={it.slug}
                    onSelect={() => go(`/articles/${it.slug}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm aria-selected:bg-accent"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{it.title}</span>
                    <ArrowLeft className="size-3.5 text-muted-foreground" />
                  </Command.Item>
                ))}
                {query.trim() && (
                  <Command.Item
                    value="__search_all"
                    onSelect={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                    className="mt-1 flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-primary aria-selected:bg-accent"
                  >
                    <Hash className="size-4" />
                    ابحث عن ”{query.trim()}“
                  </Command.Item>
                )}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
