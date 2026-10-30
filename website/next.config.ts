import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS is compiled by its Turbopack loader (set up by create-next-app)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Featured images come from the WordPress media library, which can live on any
  // domain, so next/image is allowed to load images from any HTTPS host.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  // WordPress migration: old WordPress URLs keep working.
  // "permanent: true" sends a 301 redirect, which tells Google the page has moved
  // for good, so the old page's search ranking carries over to the new URL.
  // See MIGRATION.md for the full URL map.
  async redirects() {
    return [
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/our-services/:slug", destination: "/services/:slug", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      // WordPress "date" permalinks: /2026/10/my-post  ->  /blog/my-post
      {
        source: "/:year(\\d{4})/:month(\\d{2})/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      // WordPress category and tag archives have no separate page here
      { source: "/category/:slug*", destination: "/blog", permanent: true },
      { source: "/tag/:slug*", destination: "/blog", permanent: true },
    ];
  },
};

export default nextConfig;
