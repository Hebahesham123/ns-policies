/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this app so Next doesn't trace the parent folder
  // (which contains the large source-documents tree).
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // Allow Supabase Storage public URLs. Replace the host with your project ref
    // or add it via NEXT_PUBLIC_SUPABASE_URL parsing at build time.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    // Server Actions are enabled by default in Next 15; kept here for clarity.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
