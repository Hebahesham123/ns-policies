import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import "./globals.css";

// Arabic-first UI. Cairo covers both Arabic and Latin glyphs cleanly.
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: env.siteName,
    template: `%s · ${env.siteName}`,
  },
  description: "قاعدة المعرفة الداخلية — السياسات والإجراءات وأساليب العمل، قابلة للبحث ومنظمة ومحدثة دائمًا.",
  applicationName: env.siteName,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: env.siteName,
    title: env.siteName,
    description: "قاعدة المعرفة الداخلية القابلة للبحث.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: false, follow: false }, // internal, IP-gated
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-lang="ar" suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-dvh font-sans">
        {/* Apply the stored language before paint (default Arabic) to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('ns_lang');if(l==='en'){var e=document.documentElement;e.dataset.lang='en';e.lang='en';e.dir='ltr';}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors dir="rtl" />
        </ThemeProvider>
      </body>
    </html>
  );
}
