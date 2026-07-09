import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdminSession } from "@/lib/access/guard";
import { LoginForm } from "./login-form";

export const metadata = { title: "تسجيل دخول الإدارة" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from = "/admin" } = await searchParams;
  if (await isAdminSession()) redirect("/admin");

  return (
    <div className="grid min-h-dvh place-items-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm shadow-soft-lg">
        <CardHeader className="items-center text-center">
          <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <CardTitle className="text-xl">دخول الإدارة</CardTitle>
          <CardDescription>أدخل رمز الدخول المشترك لإدارة المحتوى.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm from={from} />
        </CardContent>
      </Card>
    </div>
  );
}
