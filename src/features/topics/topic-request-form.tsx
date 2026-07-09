"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { submitTopic, type SubmitTopicState } from "@/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "جارٍ الإرسال…" : "إرسال الطلب"}
    </Button>
  );
}

export function TopicRequestForm({ onDone }: { onDone?: () => void }) {
  const [state, action] = React.useActionState<SubmitTopicState, FormData>(submitTopic, { ok: false });

  React.useEffect(() => {
    if (state.ok) {
      toast.success("شكرًا! تم إرسال طلبك.");
      onDone?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">عنوان الموضوع</Label>
        <Input id="title" name="title" placeholder="مثال: كيفية طلب الإجازة السنوية" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">التفاصيل (اختياري)</Label>
        <Textarea id="description" name="description" placeholder="ما الذي تودّ توثيقه؟" rows={4} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="requester">اسمك / بريدك (اختياري)</Label>
        <Input id="requester" name="requester" placeholder="حتى نتمكن من المتابعة" />
      </div>
      <SubmitButton />
    </form>
  );
}
