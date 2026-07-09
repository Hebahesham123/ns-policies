"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { KeyRound } from "lucide-react";
import { adminLogin, type LoginState } from "@/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "جارٍ التحقق…" : "فتح لوحة التحكم"}
    </Button>
  );
}

export function LoginForm({ from }: { from: string }) {
  const [state, action] = React.useActionState<LoginState, FormData>(adminLogin, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="from" value={from} />
      <div className="space-y-1.5">
        <Label htmlFor="passcode">رمز دخول الإدارة</Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="passcode" name="passcode" type="password" required autoFocus placeholder="أدخل رمز الدخول المشترك" className="ps-9" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
