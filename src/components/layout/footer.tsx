import Link from "next/link";
import { Bi } from "@/components/lang/bi";
import { NAV, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">NS</span>
            {SITE.name}
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold"><Bi ar="تصفّح" en="Browse" /></h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-foreground"><Bi ar={n.label} en={n.en} /></Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold"><Bi ar="شارك" en="Contribute" /></h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/submit" className="hover:text-foreground"><Bi ar="اطلب موضوعًا" en="Request a topic" /></Link></li>
            <li><Link href="/admin" className="hover:text-foreground"><Bi ar="لوحة التحكم" en="Admin" /></Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. <Bi ar="للاستخدام الداخلي فقط." en="Internal use only." /></p>
          <p><Bi ar="الوصول مقيّد على الشبكات المعتمدة." en="Access restricted to approved networks." /></p>
        </div>
      </div>
    </footer>
  );
}
