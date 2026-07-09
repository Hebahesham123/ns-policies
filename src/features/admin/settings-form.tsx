"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSetting } from "@/actions/admin-misc";

type Settings = Record<string, Record<string, any>>;

export function SettingsForm({ initial }: { initial: Settings }) {
  const [site, setSite] = React.useState(initial.site ?? {});
  const [homepage, setHomepage] = React.useState(initial.homepage ?? {});
  const [features, setFeatures] = React.useState(initial.features ?? {});
  const [saving, setSaving] = React.useState<string | null>(null);

  const save = async (key: string, value: Record<string, unknown>) => {
    setSaving(key);
    try { await updateSetting(key, value); toast.success("تم حفظ الإعدادات."); }
    catch { toast.error("فشل الحفظ."); }
    finally { setSaving(null); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">الهوية والتواصل</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>اسم الموقع</Label>
            <Input value={site.name ?? ""} onChange={(e) => setSite({ ...site, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>رابط الشعار</Label>
            <Input value={site.logo ?? ""} onChange={(e) => setSite({ ...site, logo: e.target.value })} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label>البريد الإلكتروني للتواصل</Label>
            <Input type="email" value={site.contact_email ?? ""} onChange={(e) => setSite({ ...site, contact_email: e.target.value })} />
          </div>
          <Button onClick={() => save("site", site)} disabled={saving === "site"}>{saving === "site" ? "جارٍ الحفظ…" : "حفظ الهوية"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">الصفحة الرئيسية</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>عنوان الواجهة</Label>
            <Input value={homepage.hero_title ?? ""} onChange={(e) => setHomepage({ ...homepage, hero_title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>العنوان الفرعي للواجهة</Label>
            <Textarea value={homepage.hero_subtitle ?? ""} onChange={(e) => setHomepage({ ...homepage, hero_subtitle: e.target.value })} rows={2} />
          </div>
          <Button onClick={() => save("homepage", homepage)} disabled={saving === "homepage"}>{saving === "homepage" ? "جارٍ الحفظ…" : "حفظ الصفحة الرئيسية"}</Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">الميزات</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>السماح بطلبات المواضيع</Label>
              <p className="text-xs text-muted-foreground">دع المستخدمين يقترحون مواضيع يرغبون بتوثيقها.</p>
            </div>
            <Switch checked={!!features.allow_user_topics} onCheckedChange={(v) => setFeatures({ ...features, allow_user_topics: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>تفعيل الإعجابات</Label>
              <p className="text-xs text-muted-foreground">إظهار أزرار الإعجاب على المقالات.</p>
            </div>
            <Switch checked={!!features.enable_likes} onCheckedChange={(v) => setFeatures({ ...features, enable_likes: v })} />
          </div>
          <Button onClick={() => save("features", features)} disabled={saving === "features"}>{saving === "features" ? "جارٍ الحفظ…" : "حفظ الميزات"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
