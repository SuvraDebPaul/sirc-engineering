import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Allow-list, not a wildcard.
     *
     * `hostname: "**"` turns the image optimiser into an open proxy: anyone can
     * pass any URL through your domain, consuming your optimisation quota and
     * serving third-party bytes from your origin. List the hosts you actually
     * use — local images under /public need no entry at all.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.shadcnspace.com",
        pathname: "/assets/**",
      },
    ],

    /**
     * AVIF first, WebP as the fallback.
     *
     * The default is WebP only. AVIF is typically 20–30% smaller again at the
     * same perceptual quality, and every browser that cannot decode it simply
     * negotiates WebP through the `Accept` header — so there is no cost to
     * listing it first. Encoding is slower, but it happens once per size and
     * is then cached.
     */
    formats: ["image/avif", "image/webp"],

    /**
     * Widths the optimiser is allowed to generate.
     *
     * The default list runs to 3840px, which produced a 482 KB variant of a
     * banner whose largest container in this design is about 1270px — a
     * quarter of a megabyte encoded and cached for a viewport nobody has.
     * Capping at 1920 covers every realistic display, including 2× phones.
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    /** Fixed-size images: thumbnails, logos, avatars. */
    imageSizes: [48, 64, 96, 128, 256, 384],

    /**
     * Cache optimised variants for a year. They are content-addressed by URL,
     * so a changed source image is a changed URL — there is nothing to
     * invalidate and no reason to re-encode weekly.
     */
    minimumCacheTTL: 31_536_000,
  },
};

export default nextConfig;
