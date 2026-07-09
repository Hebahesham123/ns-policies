import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (conditional + conflict resolution). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug from arbitrary text (supports unicode letters). */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Rough reading-time estimate in minutes (200 wpm). */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Compact number formatting: 1200 -> 1.2k */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(date));
}

/** Debounce a function by `wait` ms. */
export function debounce<T extends (...args: never[]) => void>(fn: T, wait = 300) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Extract plain text from a Tiptap JSON document. */
export function docToText(doc: unknown): string {
  const parts: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (typeof node.text === "string") parts.push(node.text);
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Safely decode a URL path segment. Next.js delivers non-ASCII dynamic-route
 * params (e.g. Arabic slugs) still percent-encoded, so pages must decode them
 * before querying. No-op for plain ASCII; never throws.
 */
export function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
