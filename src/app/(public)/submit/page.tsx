import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TopicRequestForm } from "@/features/topics/topic-request-form";

export const metadata: Metadata = { title: "اطلب موضوعًا", description: "اطلب من الفريق توثيق شيء ما." };

export default function SubmitPage() {
  return (
    <div className="container max-w-xl py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Lightbulb className="size-7" />
        </span>
        <h1 className="text-3xl font-bold tracking-tight">اطلب موضوعًا</h1>
        <p className="mt-2 text-muted-foreground">
          هل ينقص توثيق معيّن؟ أخبِرنا بما تودّ إضافته وسيتولّى الفريق الأمر.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TopicRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
