import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">الصفحة غير موجودة</h1>
      <p className="max-w-sm text-muted-foreground">
        الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
      </p>
      <div className="mt-2 flex gap-3">
        <Button asChild><Link href="/">العودة إلى الرئيسية</Link></Button>
        <Button asChild variant="outline"><Link href="/search">البحث</Link></Button>
      </div>
    </div>
  );
}
