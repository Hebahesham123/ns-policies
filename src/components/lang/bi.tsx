import * as React from "react";

/**
 * Renders both the Arabic and English variants; CSS (in globals.css) shows only
 * the one matching the active <html data-lang>. Works in static/prerendered
 * pages — the toggle is pure client-side CSS, no re-fetch. `as` picks the
 * wrapper element (span for inline text, div for blocks).
 */
export function Bi({
  ar,
  en,
  as: As = "span",
  className,
}: {
  ar: React.ReactNode;
  en: React.ReactNode;
  as?: any;
  className?: string;
}) {
  return (
    <>
      <As data-only="ar" className={className}>{ar}</As>
      <As data-only="en" className={className}>{en}</As>
    </>
  );
}
