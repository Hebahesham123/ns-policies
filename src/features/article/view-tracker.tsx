"use client";

import * as React from "react";
import { recordView } from "@/actions/engagement";

/** Fires a single view increment per session per article (client-guarded). */
export function ViewTracker({ articleId }: { articleId: string }) {
  React.useEffect(() => {
    const key = `viewed:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage may be unavailable */
    }
    void recordView(articleId);
  }, [articleId]);
  return null;
}
