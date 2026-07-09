"use client";

import * as React from "react";
import { Heart, Bookmark, Link2, Printer, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bumpLike } from "@/actions/engagement";
import { formatCompact, cn } from "@/lib/utils";

const LIKED = "liked-articles";
const SAVED = "saved-articles";

function readSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}
function writeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

/**
 * Like (global counter, device-guarded), bookmark (device-local), copy-link,
 * print and native share. No accounts required.
 */
export function EngagementBar({ articleId, initialLikes, title }: { articleId: string; initialLikes: number; title: string }) {
  const [likes, setLikes] = React.useState(initialLikes);
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setLiked(readSet(LIKED).has(articleId));
    setSaved(readSet(SAVED).has(articleId));
  }, [articleId]);

  const toggleLike = async () => {
    const set = readSet(LIKED);
    const next = !liked;
    setLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));
    if (next) set.add(articleId);
    else set.delete(articleId);
    writeSet(LIKED, set);
    try {
      const server = await bumpLike(articleId, next ? 1 : -1);
      setLikes(server);
    } catch {
      toast.error("تعذّر تحديث الإعجاب.");
    }
  };

  const toggleSave = () => {
    const set = readSet(SAVED);
    const next = !saved;
    setSaved(next);
    if (next) set.add(articleId);
    else set.delete(articleId);
    writeSet(SAVED, set);
    toast.success(next ? "تمّت الإضافة إلى المفضلة." : "تمّت الإزالة من المفضلة.");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("تم نسخ الرابط.");
    setTimeout(() => setCopied(false), 1500);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        /* cancelled */
      }
    } else {
      void copyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggleLike} className={cn(liked && "bg-rose-500 hover:bg-rose-500/90")}>
        <Heart className={cn("size-4", liked && "fill-current")} /> {formatCompact(likes)}
      </Button>
      <Button variant={saved ? "default" : "outline"} size="sm" onClick={toggleSave}>
        <Bookmark className={cn("size-4", saved && "fill-current")} /> {saved ? "محفوظ" : "حفظ"}
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />} نسخ الرابط
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="size-4" /> طباعة
      </Button>
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="size-4" /> مشاركة
      </Button>
    </div>
  );
}
