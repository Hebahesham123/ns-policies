import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { serverEnv } from "@/lib/env";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

/** True if the current request carries a valid admin session cookie. */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const { adminSessionSecret } = serverEnv();
  return verifySessionToken(token, adminSessionSecret);
}

/** Guard for admin pages/actions — redirects to the passcode gate if unauthed. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }
}
