"use client";

import * as React from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { TopicRequestForm } from "./topic-request-form";

export function TopicRequestCta() {
  const [open, setOpen] = React.useState(false);
  return (
    <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <span className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Lightbulb className="size-6" />
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">لم تجد ما تبحث عنه؟</h2>
          <p className="mt-2 text-muted-foreground">
            اطلب موضوعًا وسيقوم فريقنا بإنشاء التوثيق الخاص به.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">اطلب موضوعًا</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>اطلب موضوعًا</DialogTitle>
              <DialogDescription>أخبرنا بما تودّ توثيقه.</DialogDescription>
            </DialogHeader>
            <TopicRequestForm onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
