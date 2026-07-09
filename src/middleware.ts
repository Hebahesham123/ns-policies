import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/access/session";

/**
 * Edge gate.
 *
 * The PUBLIC site is open to everyone (no IP restriction).
 * Only /admin/* is protected — it requires a valid admin session cookie,
 * issued after the shared passcode is verified. /admin/login is exempt.
 *
 * (An optional IP allowlist helper still lives in `lib/access/ip.ts` if you ever
 *  want to re-gate the whole site — it is intentionally not used here.)
 */
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const secret = process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-secret";
    const ok = await verifySessionToken(token, secret);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run only where the admin gate might apply (skip static assets).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
