"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

function apply(lang: Lang) {
  const el = document.documentElement;
  el.dataset.lang = lang;
  el.lang = lang;
  el.dir = lang === "ar" ? "rtl" : "ltr";
  try {
    localStorage.setItem(LANG_COOKIE, lang);
    document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* ignore */
  }
}

/** Flip the whole interface + content between Arabic and English (instant). */
export function LanguageToggle() {
  const [lang, setLang] = React.useState<Lang>("ar");
  React.useEffect(() => {
    setLang((document.documentElement.dataset.lang as Lang) || "ar");
  }, []);

  const toggle = () => {
    const next: Lang = lang === "ar" ? "en" : "ar";
    apply(next);
    setLang(next);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="gap-1.5 font-medium" aria-label="Toggle language">
      <Languages className="size-4" />
      {lang === "ar" ? "EN" : "ع"}
    </Button>
  );
}
