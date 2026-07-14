export type Lang = "ar" | "en";
export const DEFAULT_LANG: Lang = "ar";
export const LANG_COOKIE = "ns_lang";

/**
 * Given a row's original value + its translation + the original language,
 * return the Arabic and English versions (falling back to the original when a
 * translation isn't available yet).
 */
export function bothLangs(
  original: string | null | undefined,
  alt: string | null | undefined,
  lang: string | null | undefined,
): { ar: string; en: string } {
  const o = original ?? "";
  const a = alt ?? o;
  return (lang ?? "ar") === "ar" ? { ar: o, en: a } : { ar: a, en: o };
}

/** Same for jsonb/rich content (returns the two content docs). */
export function bothDocs<T>(original: T, alt: T | null | undefined, lang: string | null | undefined): { ar: T; en: T } {
  const a = alt ?? original;
  return (lang ?? "ar") === "ar" ? { ar: original, en: a } : { ar: a, en: original };
}
