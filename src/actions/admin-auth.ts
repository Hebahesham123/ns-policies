"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { ADMIN_COOKIE, createSessionToken, passcodeMatches } from "@/lib/access/session";

export type LoginState = { error?: string };

/** Verify the shared passcode and set a signed 12h admin-session cookie. */
export async function adminLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const passcode = String(formData.get("passcode") ?? "");
  const from = String(formData.get("from") ?? "/admin");
  const { adminPasscode, adminSessionSecret } = serverEnv();

  if (!adminPasscode) return { error: "لم يتم ضبط رمز دخول الإدارة على الخادم." };
  if (!passcodeMatches(passcode, adminPasscode)) return { error: "رمز الدخول غير صحيح." };

  const token = await createSessionToken(adminSessionSecret);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function adminLogout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/");
}
