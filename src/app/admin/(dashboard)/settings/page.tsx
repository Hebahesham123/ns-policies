import { SettingsForm } from "@/features/admin/settings-form";
import { getSettings } from "@/services/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings(["site", "homepage", "features", "theme"]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">اضبط الهوية والصفحة الرئيسية والميزات.</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
