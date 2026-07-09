"use client";

import * as React from "react";
import { Check, X, FileEdit, Clock } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { setRequestStatus, convertRequestToArticle } from "@/actions/admin-misc";
import { formatDate } from "@/lib/utils";
import type { UserSubmittedTopic } from "@/types";

export function RequestsList({ requests }: { requests: UserSubmittedTopic[] }) {
  const [busy, setBusy] = React.useState<string | null>(null);
  const run = async (id: string, fn: () => Promise<unknown>, msg: string) => {
    setBusy(id);
    try { await fn(); toast.success(msg); } catch { toast.error("فشل الإجراء."); } finally { setBusy(null); }
  };

  if (!requests.length) {
    return <EmptyState icon="inbox" title="لا توجد طلبات مواضيع" description="ستظهر هنا الطلبات المقدّمة من المستخدمين." />;
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <Card key={r.id} className={`p-5 ${busy === r.id ? "opacity-50" : ""}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{r.title}</h3>
                <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "destructive" : "warning"}>{r.status}</Badge>
              </div>
              {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {formatDate(r.created_at)}
                {r.requester && <>· بواسطة {r.requester}</>}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => run(r.id, () => convertRequestToArticle(r.id), "تم إنشاء المسودة")}>
                <FileEdit className="size-4" /> تحويل
              </Button>
              {r.status !== "approved" && (
                <Button size="sm" variant="outline" onClick={() => run(r.id, () => setRequestStatus(r.id, "approved"), "تم القبول")}>
                  <Check className="size-4" /> قبول
                </Button>
              )}
              {r.status !== "rejected" && (
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => run(r.id, () => setRequestStatus(r.id, "rejected"), "تم الرفض")}>
                  <X className="size-4" /> رفض
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
