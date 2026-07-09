import { NextResponse, type NextRequest } from "next/server";
import { getClientIp, isIpAllowed } from "@/lib/access/ip";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/access/session";

/**
 * Edge gate:
 *  1. IP allowlist protects the WHOLE site (ALLOWED_IPS).
 *  2. /admin/* additionally requires a valid admin session cookie
 *     (issued after the shared passcode is verified). /admin/login is exempt.
 */
export async function middleware(req: NextRequest) {
  const allowlist = (process.env.ALLOWED_IPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const trustProxy = (process.env.TRUST_PROXY ?? "true") === "true";

  const ip = getClientIp(req.headers, trustProxy) ?? req.headers.get("x-real-ip");

  // 1) Whole-site IP allowlist — enforced in production, but never for localhost
  // (so you can test a production build locally, where there's no
  // x-forwarded-for header). Real deployments serve from a real host and enforce.
  const host = req.headers.get("host") ?? "";
  const isLocalhost = /^(localhost|127\.0\.0\.1|\[?::1\]?)(:\d+)?$/i.test(host);
  const enforceIp = process.env.NODE_ENV === "production" && !isLocalhost;
  if (enforceIp && !isIpAllowed(ip, allowlist)) {
    return new NextResponse(
      renderForbidden(ip),
      { status: 403, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  // 2) Admin passcode gate
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

function renderForbidden(ip: string | null): string {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>الوصول مقيّد</title>
  <style>
    body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0b0f1a;color:#e5e7eb;
      display:grid;place-items:center;height:100vh;margin:0}
    .card{max-width:440px;text-align:center;padding:2rem}
    h1{font-size:1.4rem;margin:0 0 .5rem}
    p{color:#9ca3af;line-height:1.7}
    code{background:#1f2937;padding:.15rem .4rem;border-radius:.35rem;direction:ltr;display:inline-block}
  </style></head>
  <body><div class="card">
    <h1>🔒 الوصول مقيّد</h1>
    <p>قاعدة المعرفة هذه متاحة فقط من الشبكات المعتمدة.</p>
    <p>عنوانك <code>${ip ?? "غير معروف"}</code> غير موجود ضمن القائمة المسموح بها.
    يُرجى التواصل مع مسؤول النظام إذا كنت تعتقد أن هذا خطأ.</p>
  </div></body></html>`;
}

export const config = {
  // Run on everything except static assets & the forbidden page itself.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest|robots.txt|sitemap.xml).*)"],
};
